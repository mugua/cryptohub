package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Trade records a completed (fully or partially filled) order execution.
// Trade 记录已完成（全部或部分成交）的订单执行
type Trade struct {
	ID         uuid.UUID       `json:"id" db:"id"`
	OrderID    uuid.UUID       `json:"order_id" db:"order_id"`
	UserID     uuid.UUID       `json:"user_id" db:"user_id"`
	Exchange   string          `json:"exchange" db:"exchange"`
	Symbol     string          `json:"symbol" db:"symbol"`
	Side       OrderSide       `json:"side" db:"side"`
	Price      decimal.Decimal `json:"price" db:"price"`
	Quantity   decimal.Decimal `json:"quantity" db:"quantity"`
	// QuoteQty is the total quote currency amount: price * quantity.
	// QuoteQty 是报价货币总金额：price * quantity
	QuoteQty   decimal.Decimal `json:"quote_qty" db:"quote_qty"`
	Fee        decimal.Decimal `json:"fee" db:"fee"`
	FeeAsset   string          `json:"fee_asset" db:"fee_asset"`
	// IsMaker indicates whether this trade was filled as a maker (passive) order.
	// IsMaker 表示此交易是否作为挂单方（被动方）成交
	IsMaker    bool            `json:"is_maker" db:"is_maker"`
	// PnL is the realised profit/loss for the trade (relevant for closing trades).
	// PnL 是交易的已实现盈亏（与平仓交易相关）
	PnL        decimal.Decimal `json:"pnl" db:"pnl"`
	StrategyID *uuid.UUID      `json:"strategy_id,omitempty" db:"strategy_id"`
	ExecutedAt time.Time       `json:"executed_at" db:"executed_at"`
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
}

// TradeFilter provides filtering options for querying trade history.
type TradeFilter struct {
	UserID     uuid.UUID
	Exchange   string
	Symbol     string
	Side       OrderSide
	StartTime  time.Time
	EndTime    time.Time
	StrategyID *uuid.UUID
	Limit      int
	Offset     int
}
