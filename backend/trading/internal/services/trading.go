package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/cryptohub/trading/internal/models"
	"github.com/cryptohub/trading/internal/services/exchange"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/segmentio/kafka-go"
)

type TradingService struct {
	db          *pgxpool.Pool
	exchanges   map[string]exchange.Exchange
	riskService *RiskService
	kafkaWriter *kafka.Writer
}

func NewTradingService(db *pgxpool.Pool, exchanges map[string]exchange.Exchange, riskService *RiskService, kafkaBroker string) *TradingService {
	var writer *kafka.Writer
	if kafkaBroker != "" {
		writer = &kafka.Writer{
			Addr:     kafka.TCP(kafkaBroker),
			Topic:    "trading-events",
			Balancer: &kafka.LeastBytes{},
		}
	}

	return &TradingService{
		db:          db,
		exchanges:   exchanges,
		riskService: riskService,
		kafkaWriter: writer,
	}
}

func (s *TradingService) ExecuteOrder(ctx context.Context, userID uuid.UUID, req *models.PlaceOrderRequest) (*models.Order, error) {
	order := &models.Order{
		ID:         uuid.New(),
		UserID:     userID,
		StrategyID: req.StrategyID,
		Exchange:   req.Exchange,
		CoinSymbol: req.CoinSymbol,
		OrderType:  req.OrderType,
		Side:       req.Side,
		Quantity:   req.Quantity,
		Price:      req.Price,
		Status:     "PENDING",
		IsPaper:    req.IsPaper,
		Leverage:   req.Leverage,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := s.riskService.CheckOrder(ctx, order); err != nil {
		order.Status = "REJECTED"
		order.ErrorMessage = err.Error()
		_ = s.saveOrder(ctx, order)
		return order, fmt.Errorf("risk check failed: %w", err)
	}

	if req.IsPaper {
		order.Status = "FILLED"
		order.FilledQty = req.Quantity
		order.FilledPrice = req.Price
		order.ExchangeOrderID = "PAPER-" + order.ID.String()
	} else {
		exch, ok := s.exchanges[req.Exchange]
		if !ok {
			order.Status = "REJECTED"
			order.ErrorMessage = "unsupported exchange: " + req.Exchange
			_ = s.saveOrder(ctx, order)
			return order, fmt.Errorf("unsupported exchange: %s", req.Exchange)
		}

		result, err := exch.PlaceOrder(ctx, req.CoinSymbol, req.Side, req.OrderType, req.Quantity, req.Price)
		if err != nil {
			order.Status = "FAILED"
			order.ErrorMessage = err.Error()
			_ = s.saveOrder(ctx, order)
			return order, fmt.Errorf("exchange order failed: %w", err)
		}

		order.ExchangeOrderID = result.OrderID
		order.Status = result.Status
		order.FilledQty = result.FilledQty
		order.FilledPrice = result.FilledPrice
	}

	if err := s.saveOrder(ctx, order); err != nil {
		return order, fmt.Errorf("saving order: %w", err)
	}

	s.publishEvent(ctx, order)
	return order, nil
}

func (s *TradingService) saveOrder(ctx context.Context, order *models.Order) error {
	if s.db == nil {
		return nil
	}
	_, err := s.db.Exec(ctx, `
		INSERT INTO orders (id, user_id, strategy_id, exchange, coin_symbol, order_type, side,
			quantity, price, filled_qty, filled_price, status, is_paper, exchange_order_id,
			leverage, error_message, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
		ON CONFLICT (id) DO UPDATE SET
			status=EXCLUDED.status, filled_qty=EXCLUDED.filled_qty, filled_price=EXCLUDED.filled_price,
			error_message=EXCLUDED.error_message, updated_at=EXCLUDED.updated_at`,
		order.ID, order.UserID, order.StrategyID, order.Exchange, order.CoinSymbol,
		order.OrderType, order.Side, order.Quantity, order.Price, order.FilledQty,
		order.FilledPrice, order.Status, order.IsPaper, order.ExchangeOrderID,
		order.Leverage, order.ErrorMessage, order.CreatedAt, order.UpdatedAt,
	)
	return err
}

func (s *TradingService) publishEvent(ctx context.Context, order *models.Order) {
	if s.kafkaWriter == nil {
		return
	}

	data, err := json.Marshal(order)
	if err != nil {
		log.Printf("failed to marshal order event: %v", err)
		return
	}

	err = s.kafkaWriter.WriteMessages(ctx, kafka.Message{
		Key:   []byte(order.UserID.String()),
		Value: data,
	})
	if err != nil {
		log.Printf("failed to publish order event: %v", err)
	}
}

func (s *TradingService) GetOrder(ctx context.Context, userID, orderID uuid.UUID) (*models.Order, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database not available")
	}
	var order models.Order
	err := s.db.QueryRow(ctx, `
		SELECT id, user_id, strategy_id, exchange, coin_symbol, order_type, side,
			quantity, price, filled_qty, filled_price, status, is_paper, exchange_order_id,
			leverage, error_message, created_at, updated_at
		FROM orders WHERE id=$1 AND user_id=$2`, orderID, userID).Scan(
		&order.ID, &order.UserID, &order.StrategyID, &order.Exchange, &order.CoinSymbol,
		&order.OrderType, &order.Side, &order.Quantity, &order.Price, &order.FilledQty,
		&order.FilledPrice, &order.Status, &order.IsPaper, &order.ExchangeOrderID,
		&order.Leverage, &order.ErrorMessage, &order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (s *TradingService) ListOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	if s.db == nil {
		return []models.Order{}, nil
	}
	rows, err := s.db.Query(ctx, `
		SELECT id, user_id, strategy_id, exchange, coin_symbol, order_type, side,
			quantity, price, filled_qty, filled_price, status, is_paper, exchange_order_id,
			leverage, error_message, created_at, updated_at
		FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.StrategyID, &o.Exchange, &o.CoinSymbol,
			&o.OrderType, &o.Side, &o.Quantity, &o.Price, &o.FilledQty,
			&o.FilledPrice, &o.Status, &o.IsPaper, &o.ExchangeOrderID,
			&o.Leverage, &o.ErrorMessage, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, nil
}

func (s *TradingService) CancelOrder(ctx context.Context, userID, orderID uuid.UUID) error {
	order, err := s.GetOrder(ctx, userID, orderID)
	if err != nil {
		return err
	}

	if order.IsPaper {
		order.Status = "CANCELLED"
		order.UpdatedAt = time.Now()
		return s.saveOrder(ctx, order)
	}

	exch, ok := s.exchanges[order.Exchange]
	if !ok {
		return fmt.Errorf("unsupported exchange: %s", order.Exchange)
	}

	if err := exch.CancelOrder(ctx, order.CoinSymbol, order.ExchangeOrderID); err != nil {
		return fmt.Errorf("cancel on exchange failed: %w", err)
	}

	order.Status = "CANCELLED"
	order.UpdatedAt = time.Now()
	return s.saveOrder(ctx, order)
}
