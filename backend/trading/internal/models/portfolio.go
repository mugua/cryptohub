package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Portfolio struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	UserID      uuid.UUID       `json:"user_id" db:"user_id"`
	Name        string          `json:"name" db:"name"`
	Description string          `json:"description" db:"description"`
	Allocations json.RawMessage `json:"allocations" db:"allocations"`
	IsActive    bool            `json:"is_active" db:"is_active"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

type CreatePortfolioRequest struct {
	Name        string          `json:"name" binding:"required"`
	Description string          `json:"description"`
	Allocations json.RawMessage `json:"allocations"`
}

type UpdatePortfolioRequest struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Allocations json.RawMessage `json:"allocations"`
	IsActive    *bool           `json:"is_active"`
}

type PortfolioPerformance struct {
	PortfolioID  uuid.UUID `json:"portfolio_id"`
	TotalValue   float64   `json:"total_value"`
	TotalReturn  float64   `json:"total_return"`
	DailyReturn  float64   `json:"daily_return"`
	WeeklyReturn float64   `json:"weekly_return"`
}
