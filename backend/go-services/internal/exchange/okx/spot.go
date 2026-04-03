package okx

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/shopspring/decimal"

	"github.com/cryptohub/backend/internal/exchange"
)

// SpotClient wraps Client with OKX spot trading methods.
// SpotClient 封装 Client 提供 OKX 现货交易方法
type SpotClient struct {
	*Client
}

// NewSpotClient creates an OKX spot trading client.
func NewSpotClient(apiKey, secretKey, passphrase, baseURL string) *SpotClient {
	return &SpotClient{Client: NewClient(apiKey, secretKey, passphrase, baseURL, nil)}
}

// GetTicker returns ticker data for a trading pair.
func (s *SpotClient) GetTicker(ctx context.Context, symbol string) (*exchange.Ticker, error) {
	path := fmt.Sprintf("/api/v5/market/ticker?instId=%s", symbol)
	data, err := s.doRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		InstID  string `json:"instId"`
		BidPx   string `json:"bidPx"`
		AskPx   string `json:"askPx"`
		Last    string `json:"last"`
		Vol24h  string `json:"vol24h"`
		Open24h string `json:"open24h"`
	}
	if err := json.Unmarshal(data, &raws); err != nil || len(raws) == 0 {
		return nil, fmt.Errorf("parse ticker: %w", err)
	}
	r := raws[0]
	last := decimal.RequireFromString(r.Last)
	open := decimal.RequireFromString(r.Open24h)
	change := decimal.Zero
	if !open.IsZero() {
		change = last.Sub(open).Div(open).Mul(decimal.NewFromInt(100))
	}
	return &exchange.Ticker{
		Symbol:    r.InstID,
		BidPrice:  decimal.RequireFromString(r.BidPx),
		AskPrice:  decimal.RequireFromString(r.AskPx),
		LastPrice: last,
		Volume24h: decimal.RequireFromString(r.Vol24h),
		Change24h: change,
		Timestamp: time.Now(),
	}, nil
}

// GetKlines returns OHLCV data from OKX.
func (s *SpotClient) GetKlines(ctx context.Context, symbol, interval string, limit int) ([]*exchange.Kline, error) {
	path := fmt.Sprintf("/api/v5/market/candles?instId=%s&bar=%s&limit=%d", symbol, interval, limit)
	data, err := s.doRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	var raw [][]string
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}
	klines := make([]*exchange.Kline, 0, len(raw))
	for _, r := range raw {
		if len(r) < 6 {
			continue
		}
		openMs := int64(0)
		fmt.Sscanf(r[0], "%d", &openMs)
		klines = append(klines, &exchange.Kline{
			OpenTime: time.UnixMilli(openMs),
			Open:     decimal.RequireFromString(r[1]),
			High:     decimal.RequireFromString(r[2]),
			Low:      decimal.RequireFromString(r[3]),
			Close:    decimal.RequireFromString(r[4]),
			Volume:   decimal.RequireFromString(r[5]),
		})
	}
	return klines, nil
}

// PlaceOrder places a new spot order on OKX.
// PlaceOrder 在 OKX 上提交现货订单
func (s *SpotClient) PlaceOrder(ctx context.Context, req *exchange.OrderRequest) (*exchange.Order, error) {
	payload := map[string]interface{}{
		"instId":  req.Symbol,
		"tdMode":  "cash",
		"side":    req.Side,
		"ordType": mapOKXOrderType(req.Type),
		"sz":      req.Quantity.String(),
	}
	if !req.Price.IsZero() {
		payload["px"] = req.Price.String()
	}
	if req.ClientOID != "" {
		payload["clOrdId"] = req.ClientOID
	}
	data, err := s.doRequest(ctx, http.MethodPost, "/api/v5/trade/order", payload)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		OrdId   string `json:"ordId"`
		ClOrdId string `json:"clOrdId"`
		SCode   string `json:"sCode"`
		SMsg    string `json:"sMsg"`
	}
	if err := json.Unmarshal(data, &raws); err != nil || len(raws) == 0 {
		return nil, fmt.Errorf("parse place order response")
	}
	r := raws[0]
	if r.SCode != "0" {
		return nil, fmt.Errorf("OKX order error %s: %s", r.SCode, r.SMsg)
	}
	return &exchange.Order{
		ExchangeOrderID: r.OrdId,
		ClientOID:       r.ClOrdId,
		Symbol:          req.Symbol,
		Side:            req.Side,
		Status:          "open",
	}, nil
}

// CancelOrder cancels an OKX spot order.
func (s *SpotClient) CancelOrder(ctx context.Context, orderID, symbol string) error {
	payload := map[string]string{"instId": symbol, "ordId": orderID}
	_, err := s.doRequest(ctx, http.MethodPost, "/api/v5/trade/cancel-order", payload)
	return err
}

// GetOrder retrieves a single order.
func (s *SpotClient) GetOrder(ctx context.Context, orderID, symbol string) (*exchange.Order, error) {
	path := fmt.Sprintf("/api/v5/trade/order?instId=%s&ordId=%s", symbol, orderID)
	data, err := s.doRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		OrdId   string `json:"ordId"`
		Symbol  string `json:"instId"`
		Side    string `json:"side"`
		OrdType string `json:"ordType"`
		State   string `json:"state"`
		Sz      string `json:"sz"`
		Px      string `json:"px"`
		AccFill string `json:"accFillSz"`
		AvgPx   string `json:"avgPx"`
	}
	if err := json.Unmarshal(data, &raws); err != nil || len(raws) == 0 {
		return nil, fmt.Errorf("parse get order response")
	}
	r := raws[0]
	return &exchange.Order{
		ExchangeOrderID: r.OrdId,
		Symbol:          r.Symbol,
		Side:            r.Side,
		Status:          mapOKXStatus(r.State),
		Quantity:        decimal.RequireFromString(r.Sz),
		Price:           decimal.RequireFromString(r.Px),
		FilledQty:       decimal.RequireFromString(r.AccFill),
		AvgPrice:        decimal.RequireFromString(r.AvgPx),
	}, nil
}

// GetOpenOrders returns all open orders for a symbol.
func (s *SpotClient) GetOpenOrders(ctx context.Context, symbol string) ([]*exchange.Order, error) {
	path := fmt.Sprintf("/api/v5/trade/orders-pending?instType=SPOT&instId=%s", symbol)
	data, err := s.doRequest(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		OrdId   string `json:"ordId"`
		Symbol  string `json:"instId"`
		Side    string `json:"side"`
		State   string `json:"state"`
		Sz      string `json:"sz"`
		Px      string `json:"px"`
		AccFill string `json:"accFillSz"`
		AvgPx   string `json:"avgPx"`
	}
	if err := json.Unmarshal(data, &raws); err != nil {
		return nil, err
	}
	orders := make([]*exchange.Order, 0, len(raws))
	for _, r := range raws {
		orders = append(orders, &exchange.Order{
			ExchangeOrderID: r.OrdId,
			Symbol:          r.Symbol,
			Side:            r.Side,
			Status:          mapOKXStatus(r.State),
			Quantity:        decimal.RequireFromString(r.Sz),
			Price:           decimal.RequireFromString(r.Px),
			FilledQty:       decimal.RequireFromString(r.AccFill),
			AvgPrice:        decimal.RequireFromString(r.AvgPx),
		})
	}
	return orders, nil
}

// GetBalance returns OKX trading account balances.
func (s *SpotClient) GetBalance(ctx context.Context) (map[string]decimal.Decimal, error) {
	data, err := s.doRequest(ctx, http.MethodGet, "/api/v5/account/balance", nil)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		Details []struct {
			Ccy     string `json:"ccy"`
			AvailBal string `json:"availBal"`
		} `json:"details"`
	}
	if err := json.Unmarshal(data, &raws); err != nil || len(raws) == 0 {
		return nil, fmt.Errorf("parse balance")
	}
	balances := make(map[string]decimal.Decimal)
	for _, d := range raws[0].Details {
		bal := decimal.RequireFromString(d.AvailBal)
		if !bal.IsZero() {
			balances[d.Ccy] = bal
		}
	}
	return balances, nil
}

func mapOKXOrderType(t string) string {
	switch t {
	case "limit":
		return "limit"
	case "stop_limit":
		return "conditional"
	default:
		return "market"
	}
}

func mapOKXStatus(s string) string {
	switch s {
	case "live":
		return "open"
	case "filled":
		return "filled"
	case "canceled":
		return "cancelled"
	case "partially_filled":
		return "open"
	default:
		return "pending"
	}
}
