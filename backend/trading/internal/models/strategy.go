package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Strategy struct {
	ID           uuid.UUID       `json:"id" db:"id"`
	UserID       uuid.UUID       `json:"user_id" db:"user_id"`
	Name         string          `json:"name" db:"name"`
	Description  string          `json:"description" db:"description"`
	StrategyType string          `json:"strategy_type" db:"strategy_type"`
	Config       json.RawMessage `json:"config" db:"config"`
	Code         string          `json:"code" db:"code"`
	IsActive     bool            `json:"is_active" db:"is_active"`
	IsPaper      bool            `json:"is_paper" db:"is_paper"`
	CreatedAt    time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at" db:"updated_at"`
}

type CreateStrategyRequest struct {
	Name         string          `json:"name" binding:"required"`
	Description  string          `json:"description"`
	StrategyType string          `json:"strategy_type" binding:"required"`
	Config       json.RawMessage `json:"config"`
	Code         string          `json:"code"`
	IsPaper      bool            `json:"is_paper"`
}

type UpdateStrategyRequest struct {
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	StrategyType string          `json:"strategy_type"`
	Config       json.RawMessage `json:"config"`
	Code         string          `json:"code"`
	IsPaper      bool            `json:"is_paper"`
}
