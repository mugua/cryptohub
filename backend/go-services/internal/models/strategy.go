package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// StrategyType categorises algorithmic trading strategies.
// StrategyType 对算法交易策略进行分类
type StrategyType string

const (
	StrategyTypeGrid      StrategyType = "grid"
	StrategyTypeDCA       StrategyType = "dca"      // Dollar-cost averaging / 定投策略
	StrategyTypeMartingale StrategyType = "martingale"
	StrategyTypeMeanRevert StrategyType = "mean_revert"
	StrategyTypeMomentum  StrategyType = "momentum"
	StrategyTypeCustom    StrategyType = "custom"
)

// StrategyStatus reflects the operational state of a strategy.
// StrategyStatus 反映策略的运行状态
type StrategyStatus string

const (
	StrategyStatusDraft    StrategyStatus = "draft"
	StrategyStatusActive   StrategyStatus = "active"
	StrategyStatusPaused   StrategyStatus = "paused"
	StrategyStatusStopped  StrategyStatus = "stopped"
	StrategyStatusBacktest StrategyStatus = "backtest"
)

// Strategy represents an algorithmic trading strategy configured by a user.
// Strategy 表示用户配置的算法交易策略
type Strategy struct {
	ID          uuid.UUID      `json:"id" db:"id"`
	UserID      uuid.UUID      `json:"user_id" db:"user_id"`
	Name        string         `json:"name" db:"name"`
	Description string         `json:"description" db:"description"`
	Type        StrategyType   `json:"type" db:"type"`
	Exchange    string         `json:"exchange" db:"exchange"`
	Symbol      string         `json:"symbol" db:"symbol"`
	// Parameters holds type-specific JSON config (e.g. grid levels, DCA interval).
	// Parameters 保存特定类型的 JSON 配置（如网格层级、定投间隔）
	Parameters  json.RawMessage `json:"parameters" db:"parameters"`
	Status      StrategyStatus  `json:"status" db:"status"`
	Performance StrategyPerformance `json:"performance" db:"performance"`
	CreatedAt   time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}

// StrategyPerformance holds aggregated performance metrics for a strategy.
// StrategyPerformance 保存策略的汇总绩效指标
type StrategyPerformance struct {
	TotalReturn    decimal.Decimal `json:"total_return"`
	WinRate        decimal.Decimal `json:"win_rate"`
	MaxDrawdown    decimal.Decimal `json:"max_drawdown"`
	SharpeRatio    decimal.Decimal `json:"sharpe_ratio"`
	TotalTrades    int             `json:"total_trades"`
	ProfitableTrades int           `json:"profitable_trades"`
	TotalFees      decimal.Decimal `json:"total_fees"`
	LastUpdated    time.Time       `json:"last_updated"`
}

// GridStrategyParams is the Parameters payload for a grid strategy.
type GridStrategyParams struct {
	UpperPrice  decimal.Decimal `json:"upper_price"`
	LowerPrice  decimal.Decimal `json:"lower_price"`
	GridCount   int             `json:"grid_count"`
	Investment  decimal.Decimal `json:"investment"`
}

// DCAStrategyParams is the Parameters payload for a DCA strategy.
type DCAStrategyParams struct {
	InvestmentPerPeriod decimal.Decimal `json:"investment_per_period"`
	IntervalHours       int             `json:"interval_hours"`
	MaxInvestment       decimal.Decimal `json:"max_investment"`
}
