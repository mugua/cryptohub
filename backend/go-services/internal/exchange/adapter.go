// Package exchange defines the ExchangeAdapter interface and shared types.
// 交易所包：定义 ExchangeAdapter 接口和共享类型
package exchange

import (
	"context"
	"time"

	"github.com/shopspring/decimal"
)

// Ticker holds the latest price data for a trading symbol.
type Ticker struct {
	Symbol    string          `json:"symbol"`
	BidPrice  decimal.Decimal `json:"bid_price"`
	AskPrice  decimal.Decimal `json:"ask_price"`
	LastPrice decimal.Decimal `json:"last_price"`
	Volume24h decimal.Decimal `json:"volume_24h"`
	Change24h decimal.Decimal `json:"change_24h"` // percentage
	Timestamp time.Time       `json:"timestamp"`
}

// Kline represents a single OHLCV candlestick bar.
type Kline struct {
	OpenTime  time.Time       `json:"open_time"`
	Open      decimal.Decimal `json:"open"`
	High      decimal.Decimal `json:"high"`
	Low       decimal.Decimal `json:"low"`
	Close     decimal.Decimal `json:"close"`
	Volume    decimal.Decimal `json:"volume"`
	CloseTime time.Time       `json:"close_time"`
}

// OrderRequest is the unified order payload sent to any exchange adapter.
type OrderRequest struct {
	Symbol    string          `json:"symbol"`
	Side      string          `json:"side"` // "buy" / "sell"
	Type      string          `json:"type"` // "market" / "limit" / "stop_limit"
	Quantity  decimal.Decimal `json:"quantity"`
	Price     decimal.Decimal `json:"price"`
	StopPrice decimal.Decimal `json:"stop_price"`
	ClientOID string          `json:"client_oid"`
}

// Order is the unified order structure returned by exchange adapters.
type Order struct {
	ExchangeOrderID string          `json:"exchange_order_id"`
	ClientOID       string          `json:"client_oid"`
	Symbol          string          `json:"symbol"`
	Side            string          `json:"side"`
	Type            string          `json:"type"`
	Status          string          `json:"status"`
	Quantity        decimal.Decimal `json:"quantity"`
	Price           decimal.Decimal `json:"price"`
	FilledQty       decimal.Decimal `json:"filled_qty"`
	AvgPrice        decimal.Decimal `json:"avg_price"`
	Fee             decimal.Decimal `json:"fee"`
	FeeAsset        string          `json:"fee_asset"`
	CreatedAt       time.Time       `json:"created_at"`
}

// Position is the unified position returned by exchange adapters for futures.
type Position struct {
	Symbol        string          `json:"symbol"`
	Side          string          `json:"side"` // "long" / "short"
	Leverage      int             `json:"leverage"`
	EntryPrice    decimal.Decimal `json:"entry_price"`
	MarkPrice     decimal.Decimal `json:"mark_price"`
	LiqPrice      decimal.Decimal `json:"liq_price"`
	Quantity      decimal.Decimal `json:"quantity"`
	Margin        decimal.Decimal `json:"margin"`
	UnrealizedPnL decimal.Decimal `json:"unrealized_pnl"`
}

// OrderBookLevel is a single price level in an order book.
type OrderBookLevel struct {
	Price    decimal.Decimal `json:"price"`
	Quantity decimal.Decimal `json:"quantity"`
}

// OrderBook is a snapshot of bid/ask levels.
type OrderBook struct {
	Symbol    string           `json:"symbol"`
	Bids      []OrderBookLevel `json:"bids"`
	Asks      []OrderBookLevel `json:"asks"`
	Timestamp time.Time        `json:"timestamp"`
}

// Trade is a single executed market trade from the exchange public feed.
type Trade struct {
	Symbol    string          `json:"symbol"`
	Price     decimal.Decimal `json:"price"`
	Quantity  decimal.Decimal `json:"quantity"`
	Side      string          `json:"side"`
	Timestamp time.Time       `json:"timestamp"`
}

// ExchangeAdapter is the unified interface for all exchange integrations.
// ExchangeAdapter 是所有交易所集成的统一接口
type ExchangeAdapter interface {
	GetTicker(ctx context.Context, symbol string) (*Ticker, error)
	GetKlines(ctx context.Context, symbol string, interval string, limit int) ([]*Kline, error)
	PlaceOrder(ctx context.Context, order *OrderRequest) (*Order, error)
	CancelOrder(ctx context.Context, orderID string, symbol string) error
	GetOrder(ctx context.Context, orderID string, symbol string) (*Order, error)
	GetOpenOrders(ctx context.Context, symbol string) ([]*Order, error)
	GetBalance(ctx context.Context) (map[string]decimal.Decimal, error)
	GetPositions(ctx context.Context) ([]*Position, error)
	SubscribeOrderBook(ctx context.Context, symbol string, ch chan<- *OrderBook) error
	SubscribeTrades(ctx context.Context, symbol string, ch chan<- *Trade) error
}
