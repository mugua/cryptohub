// Package websocket provides a real-time WebSocket hub for market data and notifications.
package websocket

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development; restrict in production.
		return true
	},
}

// MessageType identifies the type of WebSocket message.
type MessageType string

const (
	MsgTicker    MessageType = "ticker"
	MsgOrderBook MessageType = "orderbook"
	MsgTrade     MessageType = "trade"
	MsgOrder     MessageType = "order"
	MsgAlert     MessageType = "alert"
)

// Message is a typed WebSocket message envelope.
type Message struct {
	Type    MessageType `json:"type"`
	Symbol  string      `json:"symbol,omitempty"`
	Payload any         `json:"payload"`
}

// client represents a single WebSocket connection.
type client struct {
	conn *websocket.Conn
	send chan []byte
}

// Hub manages all WebSocket clients and broadcasts messages.
type Hub struct {
	mu         sync.RWMutex
	clients    map[*client]struct{}
	broadcast  chan []byte
	register   chan *client
	unregister chan *client
}

// NewHub creates a new Hub.
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*client]struct{}),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *client),
		unregister: make(chan *client),
	}
}

// Run starts the hub's event loop. Call in a goroutine.
func (h *Hub) Run() {
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = struct{}{}
			h.mu.Unlock()

		case c := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			for c := range h.clients {
				select {
				case c.send <- msg:
				default:
					close(c.send)
					delete(h.clients, c)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends a Message to all connected clients.
func (h *Hub) Broadcast(msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	h.broadcast <- data
}

// ServeWS upgrades an HTTP request to a WebSocket connection.
func (h *Hub) ServeWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	cl := &client{conn: conn, send: make(chan []byte, 256)}
	h.register <- cl

	go cl.writePump(h)
	go cl.readPump(h)
}

// ─── Simulated market data publisher ─────────────────────────────────────────

// StartMarketSimulator periodically broadcasts simulated ticker updates.
// Replace with real exchange WebSocket feeds in production.
func (h *Hub) StartMarketSimulator() {
	ticker := time.NewTicker(3 * time.Second)
	symbols := []string{"BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"}
	prices := map[string]float64{
		"BTC/USDT": 67420, "ETH/USDT": 3540, "BNB/USDT": 582, "SOL/USDT": 178,
	}
	go func() {
		for range ticker.C {
			for _, sym := range symbols {
				delta := (0.5 - float64(time.Now().UnixNano()%100)/100.0) * prices[sym] * 0.002
				prices[sym] += delta
				h.Broadcast(Message{
					Type:   MsgTicker,
					Symbol: sym,
					Payload: map[string]any{
						"symbol": sym,
						"price":  prices[sym],
						"time":   time.Now().UnixMilli(),
					},
				})
			}
		}
	}()
}

// ─── Internal client I/O ─────────────────────────────────────────────────────

func (c *client) writePump(h *Hub) {
	defer func() {
		c.conn.Close()
	}()
	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}

func (c *client) readPump(h *Hub) {
	defer func() {
		h.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}
