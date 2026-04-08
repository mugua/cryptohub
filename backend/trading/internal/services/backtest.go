package services

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
)

type BacktestResult struct {
	StrategyID  uuid.UUID  `json:"strategy_id"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     time.Time  `json:"end_date"`
	TotalReturn float64    `json:"total_return"`
	WinRate     float64    `json:"win_rate"`
	MaxDrawdown float64    `json:"max_drawdown"`
	SharpeRatio float64    `json:"sharpe_ratio"`
	TotalTrades int        `json:"total_trades"`
	Trades      []BacktestTrade `json:"trades"`
}

type BacktestTrade struct {
	EntryTime  time.Time `json:"entry_time"`
	ExitTime   time.Time `json:"exit_time"`
	Side       string    `json:"side"`
	EntryPrice float64   `json:"entry_price"`
	ExitPrice  float64   `json:"exit_price"`
	Quantity   float64   `json:"quantity"`
	PnL        float64   `json:"pnl"`
}

type BacktestRequest struct {
	StrategyID uuid.UUID `json:"strategy_id"`
	Symbol     string    `json:"symbol" binding:"required"`
	StartDate  string    `json:"start_date" binding:"required"`
	EndDate    string    `json:"end_date" binding:"required"`
	Capital    float64   `json:"capital" binding:"required"`
	ShortMA    int       `json:"short_ma"`
	LongMA     int       `json:"long_ma"`
}

type BacktestService struct{}

func NewBacktestService() *BacktestService {
	return &BacktestService{}
}

func (s *BacktestService) RunBacktest(_ context.Context, req *BacktestRequest) (*BacktestResult, error) {
	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	shortMA := req.ShortMA
	if shortMA == 0 {
		shortMA = 10
	}
	longMA := req.LongMA
	if longMA == 0 {
		longMA = 30
	}

	// Generate synthetic price data for simulation
	days := int(endDate.Sub(startDate).Hours() / 24)
	if days <= longMA {
		days = longMA + 50
	}

	prices := generatePrices(days, 100.0)

	var trades []BacktestTrade
	var inPosition bool
	var entryPrice float64
	var entryTime time.Time
	capital := req.Capital
	quantity := 0.0

	for i := longMA; i < len(prices); i++ {
		shortAvg := movingAverage(prices, i, shortMA)
		longAvg := movingAverage(prices, i, longMA)
		currentTime := startDate.AddDate(0, 0, i)

		if !inPosition && shortAvg > longAvg {
			// Buy signal
			entryPrice = prices[i]
			quantity = capital / entryPrice
			entryTime = currentTime
			inPosition = true
		} else if inPosition && shortAvg < longAvg {
			// Sell signal
			exitPrice := prices[i]
			pnl := (exitPrice - entryPrice) * quantity
			trades = append(trades, BacktestTrade{
				EntryTime:  entryTime,
				ExitTime:   currentTime,
				Side:       "BUY",
				EntryPrice: entryPrice,
				ExitPrice:  exitPrice,
				Quantity:   quantity,
				PnL:        pnl,
			})
			capital += pnl
			inPosition = false
		}
	}

	// Calculate metrics
	totalReturn := 0.0
	wins := 0
	var returns []float64
	for _, t := range trades {
		totalReturn += t.PnL
		ret := t.PnL / (t.EntryPrice * t.Quantity)
		returns = append(returns, ret)
		if t.PnL > 0 {
			wins++
		}
	}

	winRate := 0.0
	if len(trades) > 0 {
		winRate = float64(wins) / float64(len(trades)) * 100
	}

	maxDrawdown := calculateMaxDrawdown(trades, req.Capital)
	sharpeRatio := calculateSharpe(returns)

	return &BacktestResult{
		StrategyID:  req.StrategyID,
		StartDate:   startDate,
		EndDate:     endDate,
		TotalReturn: totalReturn,
		WinRate:     winRate,
		MaxDrawdown: maxDrawdown,
		SharpeRatio: sharpeRatio,
		TotalTrades: len(trades),
		Trades:      trades,
	}, nil
}

func generatePrices(n int, start float64) []float64 {
	prices := make([]float64, n)
	prices[0] = start
	// Simple deterministic walk for reproducible backtests
	for i := 1; i < n; i++ {
		change := math.Sin(float64(i)*0.1) * 2
		prices[i] = prices[i-1] + change
		if prices[i] < 1 {
			prices[i] = 1
		}
	}
	return prices
}

func movingAverage(prices []float64, endIdx, period int) float64 {
	sum := 0.0
	for i := endIdx - period + 1; i <= endIdx; i++ {
		sum += prices[i]
	}
	return sum / float64(period)
}

func calculateMaxDrawdown(trades []BacktestTrade, initialCapital float64) float64 {
	if len(trades) == 0 {
		return 0
	}

	peak := initialCapital
	maxDD := 0.0
	equity := initialCapital

	for _, t := range trades {
		equity += t.PnL
		if equity > peak {
			peak = equity
		}
		dd := (peak - equity) / peak * 100
		if dd > maxDD {
			maxDD = dd
		}
	}
	return maxDD
}

func calculateSharpe(returns []float64) float64 {
	if len(returns) < 2 {
		return 0
	}

	sum := 0.0
	for _, r := range returns {
		sum += r
	}
	mean := sum / float64(len(returns))

	variance := 0.0
	for _, r := range returns {
		variance += (r - mean) * (r - mean)
	}
	variance /= float64(len(returns) - 1)
	stddev := math.Sqrt(variance)

	if stddev == 0 {
		return 0
	}

	riskFreeRate := 0.0
	return (mean - riskFreeRate) / stddev * math.Sqrt(252)
}
