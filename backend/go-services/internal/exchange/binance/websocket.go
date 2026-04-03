package binance

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"

	"github.com/cryptohub/backend/internal/exchange"
	"github.com/shopspring/decimal"
)

const wsBaseURL = "wss://stream.binance.com:9443/ws"

// wsConnect dials a Binance WebSocket stream and returns the connection.
// wsConnect 连接 Binance WebSocket 流并返回连接对象
func wsConnect(ctx context.Context, streamURL string) (*websocket.Conn, error) {
	dialer := websocket.DefaultDialer
	conn, _, err := dialer.DialContext(ctx, streamURL, nil)
	if err != nil {
		return nil, fmt.Errorf("ws dial %s: %w", streamURL, err)
	}
	return conn, nil
}

// SubscribeOrderBook streams order book updates for a symbol.
// SubscribeOrderBook 流式传输交易对的订单簿更新
func SubscribeOrderBook(ctx context.Context, symbol string, ch chan<- *exchange.OrderBook, log *zap.Logger) error {
	stream := fmt.Sprintf("%s/%s@depth20@100ms", wsBaseURL, strings.ToLower(symbol))
	conn, err := wsConnect(ctx, stream)
	if err != nil {
		return err
	}
	go func() {
		defer conn.Close()
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Warn("orderbook ws read error", zap.Error(err))
				return
			}
			var raw struct {
				Bids [][]string `json:"bids"`
				Asks [][]string `json:"asks"`
			}
			if err := json.Unmarshal(msg, &raw); err != nil {
				continue
			}
			ob := &exchange.OrderBook{
				Symbol:    symbol,
				Timestamp: time.Now(),
				Bids:      parseLevels(raw.Bids),
				Asks:      parseLevels(raw.Asks),
			}
			select {
			case ch <- ob:
			default:
			}
		}
	}()
	return nil
}

// SubscribeTrades streams public trade executions for a symbol.
// SubscribeTrades 流式传输交易对的公共成交数据
func SubscribeTrades(ctx context.Context, symbol string, ch chan<- *exchange.Trade, log *zap.Logger) error {
	stream := fmt.Sprintf("%s/%s@trade", wsBaseURL, strings.ToLower(symbol))
	conn, err := wsConnect(ctx, stream)
	if err != nil {
		return err
	}
	go func() {
		defer conn.Close()
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Warn("trades ws read error", zap.Error(err))
				return
			}
			var raw struct {
				Symbol string `json:"s"`
				Price  string `json:"p"`
				Qty    string `json:"q"`
				IsBuy  bool   `json:"m"` // true = market maker = seller-initiated
				Time   int64  `json:"T"`
			}
			if err := json.Unmarshal(msg, &raw); err != nil {
				continue
			}
			side := "buy"
			if raw.IsBuy {
				side = "sell"
			}
			t := &exchange.Trade{
				Symbol:    raw.Symbol,
				Price:     decimal.RequireFromString(raw.Price),
				Quantity:  decimal.RequireFromString(raw.Qty),
				Side:      side,
				Timestamp: time.UnixMilli(raw.Time),
			}
			select {
			case ch <- t:
			default:
			}
		}
	}()
	return nil
}

// SubscribeTicker streams 24hr mini-ticker for a symbol.
// SubscribeTicker 流式传输交易对的 24 小时迷你行情
func SubscribeTicker(ctx context.Context, symbol string, ch chan<- *exchange.Ticker, log *zap.Logger) error {
	stream := fmt.Sprintf("%s/%s@miniTicker", wsBaseURL, strings.ToLower(symbol))
	conn, err := wsConnect(ctx, stream)
	if err != nil {
		return err
	}
	go func() {
		defer conn.Close()
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}
			conn.SetReadDeadline(time.Now().Add(30 * time.Second))
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Warn("ticker ws read error", zap.Error(err))
				return
			}
			var raw struct {
				Symbol    string `json:"s"`
				Close     string `json:"c"`
				Volume    string `json:"v"`
				OpenPrice string `json:"o"`
			}
			if err := json.Unmarshal(msg, &raw); err != nil {
				continue
			}
			last := decimal.RequireFromString(raw.Close)
			open := decimal.RequireFromString(raw.OpenPrice)
			change := decimal.Zero
			if !open.IsZero() {
				change = last.Sub(open).Div(open).Mul(decimal.NewFromInt(100))
			}
			t := &exchange.Ticker{
				Symbol:    raw.Symbol,
				LastPrice: last,
				Volume24h: decimal.RequireFromString(raw.Volume),
				Change24h: change,
				Timestamp: time.Now(),
			}
			select {
			case ch <- t:
			default:
			}
		}
	}()
	return nil
}

func parseLevels(raw [][]string) []exchange.OrderBookLevel {
	levels := make([]exchange.OrderBookLevel, 0, len(raw))
	for _, r := range raw {
		if len(r) < 2 {
			continue
		}
		levels = append(levels, exchange.OrderBookLevel{
			Price:    decimal.RequireFromString(r[0]),
			Quantity: decimal.RequireFromString(r[1]),
		})
	}
	return levels
}
