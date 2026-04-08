package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	UserID          uuid.UUID  `json:"user_id" db:"user_id"`
	StrategyID      *uuid.UUID `json:"strategy_id,omitempty" db:"strategy_id"`
	Exchange        string     `json:"exchange" db:"exchange"`
	CoinSymbol      string     `json:"coin_symbol" db:"coin_symbol"`
	OrderType       string     `json:"order_type" db:"order_type"`
	Side            string     `json:"side" db:"side"`
	Quantity        float64    `json:"quantity" db:"quantity"`
	Price           float64    `json:"price" db:"price"`
	FilledQty       float64    `json:"filled_qty" db:"filled_qty"`
	FilledPrice     float64    `json:"filled_price" db:"filled_price"`
	Status          string     `json:"status" db:"status"`
	IsPaper         bool       `json:"is_paper" db:"is_paper"`
	ExchangeOrderID string     `json:"exchange_order_id,omitempty" db:"exchange_order_id"`
	Leverage        float64    `json:"leverage" db:"leverage"`
	ErrorMessage    string     `json:"error_message,omitempty" db:"error_message"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

type PlaceOrderRequest struct {
	Exchange   string     `json:"exchange" binding:"required"`
	CoinSymbol string     `json:"coin_symbol" binding:"required"`
	OrderType  string     `json:"order_type" binding:"required"`
	Side       string     `json:"side" binding:"required"`
	Quantity   float64    `json:"quantity" binding:"required"`
	Price      float64    `json:"price"`
	IsPaper    bool       `json:"is_paper"`
	StrategyID *uuid.UUID `json:"strategy_id"`
	Leverage   float64    `json:"leverage"`
}
