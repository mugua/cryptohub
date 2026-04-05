package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// PositionSide indicates whether the position is long or short.
// PositionSide 指示仓位是多头还是空头
type PositionSide string

const (
	PositionSideLong  PositionSide = "long"
	PositionSideShort PositionSide = "short"
	PositionSideBoth  PositionSide = "both" // hedge mode / 对冲模式
)

// Position represents an open futures or margin position.
// Position 表示开放的期货或保证金仓位
type Position struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	UserID         uuid.UUID       `json:"user_id" db:"user_id"`
	Exchange       string          `json:"exchange" db:"exchange"`
	Symbol         string          `json:"symbol" db:"symbol"`
	Side           PositionSide    `json:"side" db:"side"`
	Leverage       int             `json:"leverage" db:"leverage"`
	EntryPrice     decimal.Decimal `json:"entry_price" db:"entry_price"`
	MarkPrice      decimal.Decimal `json:"mark_price" db:"mark_price"`
	LiqPrice       decimal.Decimal `json:"liq_price" db:"liq_price"`
	Quantity       decimal.Decimal `json:"quantity" db:"quantity"`
	Margin         decimal.Decimal `json:"margin" db:"margin"`
	// UnrealizedPnL is computed as (mark_price - entry_price) * quantity for longs.
	// UnrealizedPnL = (mark_price - entry_price) * quantity，多头为正
	UnrealizedPnL  decimal.Decimal `json:"unrealized_pnl" db:"unrealized_pnl"`
	RealizedPnL    decimal.Decimal `json:"realized_pnl" db:"realized_pnl"`
	// ROE is the return on equity as a percentage.
	// ROE 是权益回报率（百分比）
	ROE            decimal.Decimal `json:"roe" db:"roe"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at" db:"updated_at"`
}

// PositionUpdate carries real-time position data pushed via WebSocket.
type PositionUpdate struct {
	UserID    uuid.UUID       `json:"user_id"`
	Positions []*Position     `json:"positions"`
	Timestamp time.Time       `json:"timestamp"`
}
