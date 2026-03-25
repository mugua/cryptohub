package models

import "time"

// ─── Market ──────────────────────────────────────────────────────────────────

// Ticker represents a spot price snapshot.
type Ticker struct {
	Symbol      string  `json:"symbol"`
	Price       float64 `json:"price"`
	Change24h   float64 `json:"change24h"`
	ChangePct   float64 `json:"changePct24h"`
	High24h     float64 `json:"high24h"`
	Low24h      float64 `json:"low24h"`
	Volume24h   float64 `json:"volume24h"`
	MarketCap   float64 `json:"marketCap,omitempty"`
	Timestamp   int64   `json:"timestamp"`
}

// Candle represents an OHLCV bar.
type Candle struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// ─── Strategy ────────────────────────────────────────────────────────────────

// StrategyStatus describes whether a strategy is active.
type StrategyStatus string

const (
	StrategyRunning    StrategyStatus = "running"
	StrategyStopped    StrategyStatus = "stopped"
	StrategyBacktest   StrategyStatus = "backtesting"
	StrategyError      StrategyStatus = "error"
)

// Strategy represents a quantitative trading strategy configuration.
type Strategy struct {
	ID           string            `json:"id" db:"id"`
	UserID       string            `json:"userId" db:"user_id"`
	Name         string            `json:"name" db:"name"`
	Type         string            `json:"type" db:"type"`
	Symbol       string            `json:"symbol" db:"symbol"`
	Exchange     string            `json:"exchange" db:"exchange"`
	Status       StrategyStatus    `json:"status" db:"status"`
	PnL          float64           `json:"pnl" db:"pnl"`
	PnLPct       float64           `json:"pnlPct" db:"pnl_pct"`
	WinRate      float64           `json:"winRate" db:"win_rate"`
	TotalTrades  int               `json:"totalTrades" db:"total_trades"`
	Params       map[string]any    `json:"params" db:"params"`
	CreatedAt    time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time         `json:"updatedAt" db:"updated_at"`
	LastRunAt    *time.Time        `json:"lastRunAt,omitempty" db:"last_run_at"`
}

// ─── Order ───────────────────────────────────────────────────────────────────

// OrderSide is buy or sell.
type OrderSide string

const (
	Buy  OrderSide = "buy"
	Sell OrderSide = "sell"
)

// OrderType is market, limit, etc.
type OrderType string

const (
	Market      OrderType = "market"
	Limit       OrderType = "limit"
	StopLimit   OrderType = "stop_limit"
)

// OrderStatus describes the order lifecycle.
type OrderStatus string

const (
	OrderOpen            OrderStatus = "open"
	OrderFilled          OrderStatus = "filled"
	OrderPartiallyFilled OrderStatus = "partially_filled"
	OrderCancelled       OrderStatus = "cancelled"
	OrderRejected        OrderStatus = "rejected"
)

// Order represents a trading order.
type Order struct {
	ID             string      `json:"id" db:"id"`
	UserID         string      `json:"userId" db:"user_id"`
	Exchange       string      `json:"exchange" db:"exchange"`
	Symbol         string      `json:"symbol" db:"symbol"`
	Side           OrderSide   `json:"side" db:"side"`
	Type           OrderType   `json:"type" db:"type"`
	Price          *float64    `json:"price,omitempty" db:"price"`
	Quantity       float64     `json:"quantity" db:"quantity"`
	FilledQuantity float64     `json:"filledQuantity" db:"filled_quantity"`
	Status         OrderStatus `json:"status" db:"status"`
	StrategyID     *string     `json:"strategyId,omitempty" db:"strategy_id"`
	CreatedAt      time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time   `json:"updatedAt" db:"updated_at"`
}

// ─── Exchange Account ─────────────────────────────────────────────────────────

// ExchangeAccount stores exchange API credentials (encrypted).
type ExchangeAccount struct {
	ID           string     `json:"id" db:"id"`
	UserID       string     `json:"userId" db:"user_id"`
	Exchange     string     `json:"exchange" db:"exchange"`
	Label        string     `json:"label" db:"label"`
	APIKey       string     `json:"apiKey" db:"api_key"`       // masked on read
	APISecret    string     `json:"-" db:"api_secret"`         // never serialized
	Passphrase   string     `json:"-" db:"passphrase"`         // never serialized
	IsConnected  bool       `json:"isConnected" db:"is_connected"`
	Permissions  []string   `json:"permissions" db:"permissions"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	LastSyncAt   *time.Time `json:"lastSyncAt,omitempty" db:"last_sync_at"`
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

// Asset represents a single coin holding in a portfolio.
type Asset struct {
	Coin     string  `json:"coin"`
	Balance  float64 `json:"balance"`
	Available float64 `json:"available"`
	Frozen   float64 `json:"frozen"`
	USDValue float64 `json:"usdValue"`
}

// Position represents an open derivative position.
type Position struct {
	Symbol         string  `json:"symbol"`
	Side           string  `json:"side"`
	Size           float64 `json:"size"`
	EntryPrice     float64 `json:"entryPrice"`
	MarkPrice      float64 `json:"markPrice"`
	UnrealizedPnL  float64 `json:"unrealizedPnl"`
	Leverage       int     `json:"leverage"`
}

// Portfolio is a full snapshot of the account.
type Portfolio struct {
	TotalUSDValue float64    `json:"totalUsdValue"`
	DailyPnL      float64    `json:"dailyPnl"`
	DailyPnLPct   float64    `json:"dailyPnlPct"`
	Assets        []Asset    `json:"assets"`
	Positions     []Position `json:"positions"`
}
