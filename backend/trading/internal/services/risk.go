package services

import (
	"context"
	"fmt"

	"github.com/cryptohub/trading/internal/models"
)

type RiskService struct {
	maxPositionSize float64
	maxLeverage     float64
	dailyLossLimit  float64
	maxOpenOrders   int
}

func NewRiskService() *RiskService {
	return &RiskService{
		maxPositionSize: 100000,
		maxLeverage:     20,
		dailyLossLimit:  10000,
		maxOpenOrders:   50,
	}
}

func (s *RiskService) CheckOrder(_ context.Context, order *models.Order) error {
	// Position size limit
	positionValue := order.Quantity * order.Price
	if positionValue > s.maxPositionSize {
		return fmt.Errorf("position size %.2f exceeds maximum %.2f", positionValue, s.maxPositionSize)
	}

	// Leverage limit
	if order.Leverage > s.maxLeverage {
		return fmt.Errorf("leverage %.1f exceeds maximum %.1f", order.Leverage, s.maxLeverage)
	}

	// Daily loss limit check (simplified — in production, aggregate from DB)
	if positionValue > s.dailyLossLimit*s.maxLeverage {
		return fmt.Errorf("order exceeds daily loss exposure limit")
	}

	return nil
}
