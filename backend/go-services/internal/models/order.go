package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// OrderSide represents the direction of the order: buy or sell.
// OrderSide 表示订单方向：买入或卖出
type OrderSide string

const (
	OrderSideBuy  OrderSide = "buy"
	OrderSideSell OrderSide = "sell"
)

// OrderType defines the execution mechanism of an order.
// OrderType 定义订单的执行机制
type OrderType string

const (
	OrderTypeMarket    OrderType = "market"
	OrderTypeLimit     OrderType = "limit"
	OrderTypeStopLimit OrderType = "stop_limit"
)

// OrderStatus tracks the lifecycle of an order.
// OrderStatus 跟踪订单的生命周期
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusOpen      OrderStatus = "open"
	OrderStatusFilled    OrderStatus = "filled"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusRejected  OrderStatus = "rejected"
)

// Order represents a trading order on an exchange.
// Order 表示交易所上的交易订单
type Order struct {
	ID              uuid.UUID       `json:"id" db:"id"`
	UserID          uuid.UUID       `json:"user_id" db:"user_id"`
	Exchange        string          `json:"exchange" db:"exchange"`
	Symbol          string          `json:"symbol" db:"symbol"`
	Side            OrderSide       `json:"side" db:"side"`
	Type            OrderType       `json:"type" db:"type"`
	Quantity        decimal.Decimal `json:"quantity" db:"quantity"`
	Price           decimal.Decimal `json:"price" db:"price"`
	StopPrice       decimal.Decimal `json:"stop_price" db:"stop_price"`
	Status          OrderStatus     `json:"status" db:"status"`
	ExchangeOrderID string          `json:"exchange_order_id" db:"exchange_order_id"`
	// FilledQty is the quantity that has been executed so far.
	// FilledQty 是迄今已执行的数量
	FilledQty  decimal.Decimal `json:"filled_qty" db:"filled_qty"`
	AvgPrice   decimal.Decimal `json:"avg_price" db:"avg_price"`
	Fee        decimal.Decimal `json:"fee" db:"fee"`
	FeeAsset   string          `json:"fee_asset" db:"fee_asset"`
	ClientOID  string          `json:"client_oid" db:"client_oid"` // Client-generated order ID
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at" db:"updated_at"`
}

// PlaceOrderRequest is the API payload for placing a new order.
type PlaceOrderRequest struct {
	Exchange  string          `json:"exchange" binding:"required,oneof=binance okx bybit"`
	Symbol    string          `json:"symbol" binding:"required"`
	Side      OrderSide       `json:"side" binding:"required,oneof=buy sell"`
	Type      OrderType       `json:"type" binding:"required,oneof=market limit stop_limit"`
	Quantity  decimal.Decimal `json:"quantity" binding:"required"`
	Price     decimal.Decimal `json:"price"`
	StopPrice decimal.Decimal `json:"stop_price"`
}

// CancelOrderRequest is the payload for cancelling an existing order.
type CancelOrderRequest struct {
	Exchange string `json:"exchange" binding:"required"`
	Symbol   string `json:"symbol" binding:"required"`
}
