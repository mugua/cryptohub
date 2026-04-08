package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	mu          sync.RWMutex
	clients     map[*Client]bool
	symbols     map[string]map[*Client]bool
	broadcast   chan []byte
	register    chan *Client
	unregister  chan *Client
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

type wsMessage struct {
	Action string `json:"action"`
	Symbol string `json:"symbol"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		symbols:    make(map[string]map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func NewClient(hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}
}

func (c *Client) Conn() *websocket.Conn { return c.conn }
func (c *Client) Send() chan []byte      { return c.send }
func (c *Client) Close()                 { c.conn.Close() }

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				for symbol, subscribers := range h.symbols {
					delete(subscribers, client)
					if len(subscribers) == 0 {
						delete(h.symbols, symbol)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					go func(c *Client) {
						h.Unregister(c)
					}(client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *Hub) HandleMessage(client *Client, data []byte) {
	var msg wsMessage
	if err := json.Unmarshal(data, &msg); err != nil {
		log.Printf("invalid ws message: %v", err)
		return
	}

	switch msg.Action {
	case "subscribe":
		h.subscribe(client, msg.Symbol)
	case "unsubscribe":
		h.unsubscribeClient(client, msg.Symbol)
	}
}

func (h *Hub) subscribe(client *Client, symbol string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.symbols[symbol] == nil {
		h.symbols[symbol] = make(map[*Client]bool)
	}
	h.symbols[symbol][client] = true
}

func (h *Hub) unsubscribeClient(client *Client, symbol string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if subscribers, ok := h.symbols[symbol]; ok {
		delete(subscribers, client)
		if len(subscribers) == 0 {
			delete(h.symbols, symbol)
		}
	}
}

func (h *Hub) BroadcastToSymbol(symbol string, data []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if subscribers, ok := h.symbols[symbol]; ok {
		for client := range subscribers {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

func (h *Hub) Broadcast(data []byte) {
	h.broadcast <- data
}
