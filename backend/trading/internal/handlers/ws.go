package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/cryptohub/trading/internal/ws"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSHandler struct {
	hub *ws.Hub
}

func NewWSHandler(hub *ws.Hub) *WSHandler {
	return &WSHandler{hub: hub}
}

func (h *WSHandler) Handle(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("websocket upgrade error: %v", err)
		return
	}

	client := ws.NewClient(h.hub, conn)
	h.hub.Register(client)

	go h.readPump(client)
	go h.writePump(client)
}

func (h *WSHandler) readPump(client *ws.Client) {
	defer func() {
		h.hub.Unregister(client)
		client.Close()
	}()

	client.Conn().SetReadDeadline(time.Now().Add(60 * time.Second))
	client.Conn().SetPongHandler(func(string) error {
		client.Conn().SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := client.Conn().ReadMessage()
		if err != nil {
			break
		}
		h.hub.HandleMessage(client, message)
	}
}

func (h *WSHandler) writePump(client *ws.Client) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		client.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send():
			if !ok {
				client.Conn().WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			client.Conn().SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn().WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			client.Conn().SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := client.Conn().WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
