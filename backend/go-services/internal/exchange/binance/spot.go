package binance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/shopspring/decimal"

	"github.com/cryptohub/backend/internal/exchange"
)

// SpotClient extends Client with spot trading operations.
// SpotClient 扩展 Client 以支持现货交易操作
type SpotClient struct {
	*Client
}

// NewSpotClient creates a SpotClient wrapping the base Client.
func NewSpotClient(apiKey, secretKey, baseURL string) *SpotClient {
	return &SpotClient{Client: NewClient(apiKey, secretKey, baseURL, nil)}
}

// GetTicker returns the best bid/ask and last price for a symbol.
// GetTicker 返回交易对的最优买卖价和最新成交价
func (s *SpotClient) GetTicker(ctx context.Context, symbol string) (*exchange.Ticker, error) {
	params := url.Values{"symbol": {symbol}}
	body, err := s.doRequest(ctx, http.MethodGet, "/api/v3/ticker/bookTicker", params, false)
	if err != nil {
		return nil, err
	}
	var raw struct {
		Symbol   string `json:"symbol"`
		BidPrice string `json:"bidPrice"`
		AskPrice string `json:"askPrice"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("parse ticker: %w", err)
	}
	// Fetch 24h stats for volume and price change.
	params2 := url.Values{"symbol": {symbol}}
	body2, err := s.doRequest(ctx, http.MethodGet, "/api/v3/ticker/24hr", params2, false)
	if err != nil {
		return nil, err
	}
	var stats struct {
		LastPrice   string `json:"lastPrice"`
		Volume      string `json:"volume"`
		PriceChange string `json:"priceChangePercent"`
	}
	if err := json.Unmarshal(body2, &stats); err != nil {
		return nil, fmt.Errorf("parse 24hr stats: %w", err)
	}
	return &exchange.Ticker{
		Symbol:    symbol,
		BidPrice:  decimal.RequireFromString(raw.BidPrice),
		AskPrice:  decimal.RequireFromString(raw.AskPrice),
		LastPrice: decimal.RequireFromString(stats.LastPrice),
		Volume24h: decimal.RequireFromString(stats.Volume),
		Change24h: decimal.RequireFromString(stats.PriceChange),
		Timestamp: time.Now(),
	}, nil
}

// GetKlines returns OHLCV candlestick data.
// GetKlines 返回 OHLCV K 线数据
func (s *SpotClient) GetKlines(ctx context.Context, symbol, interval string, limit int) ([]*exchange.Kline, error) {
	params := url.Values{
		"symbol":   {symbol},
		"interval": {interval},
		"limit":    {strconv.Itoa(limit)},
	}
	body, err := s.doRequest(ctx, http.MethodGet, "/api/v3/klines", params, false)
	if err != nil {
		return nil, err
	}
	var raw [][]interface{}
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("parse klines: %w", err)
	}
	klines := make([]*exchange.Kline, 0, len(raw))
	for _, r := range raw {
		k := &exchange.Kline{
			OpenTime:  time.UnixMilli(int64(r[0].(float64))),
			Open:      decimal.RequireFromString(r[1].(string)),
			High:      decimal.RequireFromString(r[2].(string)),
			Low:       decimal.RequireFromString(r[3].(string)),
			Close:     decimal.RequireFromString(r[4].(string)),
			Volume:    decimal.RequireFromString(r[5].(string)),
			CloseTime: time.UnixMilli(int64(r[6].(float64))),
		}
		klines = append(klines, k)
	}
	return klines, nil
}

// PlaceOrder places a new spot order on Binance.
// PlaceOrder 在 Binance 上提交新的现货订单
func (s *SpotClient) PlaceOrder(ctx context.Context, req *exchange.OrderRequest) (*exchange.Order, error) {
	params := url.Values{
		"symbol":   {req.Symbol},
		"side":     {mapSide(req.Side)},
		"type":     {mapOrderType(req.Type)},
		"quantity": {req.Quantity.String()},
	}
	if !req.Price.IsZero() {
		params.Set("price", req.Price.String())
		params.Set("timeInForce", "GTC")
	}
	if !req.StopPrice.IsZero() {
		params.Set("stopPrice", req.StopPrice.String())
	}
	if req.ClientOID != "" {
		params.Set("newClientOrderId", req.ClientOID)
	}
	body, err := s.doRequest(ctx, http.MethodPost, "/api/v3/order", params, true)
	if err != nil {
		return nil, err
	}
	return parseOrder(body)
}

// CancelOrder cancels an open spot order.
// CancelOrder 取消未成交的现货订单
func (s *SpotClient) CancelOrder(ctx context.Context, orderID, symbol string) error {
	params := url.Values{
		"symbol":  {symbol},
		"orderId": {orderID},
	}
	_, err := s.doRequest(ctx, http.MethodDelete, "/api/v3/order", params, true)
	return err
}

// GetOrder retrieves a single order by ID.
func (s *SpotClient) GetOrder(ctx context.Context, orderID, symbol string) (*exchange.Order, error) {
	params := url.Values{
		"symbol":  {symbol},
		"orderId": {orderID},
	}
	body, err := s.doRequest(ctx, http.MethodGet, "/api/v3/order", params, true)
	if err != nil {
		return nil, err
	}
	return parseOrder(body)
}

// GetOpenOrders retrieves all open orders for a symbol.
func (s *SpotClient) GetOpenOrders(ctx context.Context, symbol string) ([]*exchange.Order, error) {
	params := url.Values{"symbol": {symbol}}
	body, err := s.doRequest(ctx, http.MethodGet, "/api/v3/openOrders", params, true)
	if err != nil {
		return nil, err
	}
	var raws []json.RawMessage
	if err := json.Unmarshal(body, &raws); err != nil {
		return nil, err
	}
	orders := make([]*exchange.Order, 0, len(raws))
	for _, r := range raws {
		o, err := parseOrder(r)
		if err != nil {
			continue
		}
		orders = append(orders, o)
	}
	return orders, nil
}

// GetBalance returns the spot wallet balances.
// GetBalance 返回现货钱包余额
func (s *SpotClient) GetBalance(ctx context.Context) (map[string]decimal.Decimal, error) {
	body, err := s.doRequest(ctx, http.MethodGet, "/api/v3/account", nil, true)
	if err != nil {
		return nil, err
	}
	var resp struct {
		Balances []struct {
			Asset  string `json:"asset"`
			Free   string `json:"free"`
			Locked string `json:"locked"`
		} `json:"balances"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	balances := make(map[string]decimal.Decimal)
	for _, b := range resp.Balances {
		free := decimal.RequireFromString(b.Free)
		if !free.IsZero() {
			balances[b.Asset] = free
		}
	}
	return balances, nil
}

// GetPositions is a no-op for spot; positions are tracked as balances.
func (s *SpotClient) GetPositions(_ context.Context) ([]*exchange.Position, error) {
	return nil, nil
}

// --- helpers ---

func parseOrder(data []byte) (*exchange.Order, error) {
	var r struct {
		OrderID         int64  `json:"orderId"`
		ClientOrderID   string `json:"clientOrderId"`
		Symbol          string `json:"symbol"`
		Side            string `json:"side"`
		Type            string `json:"type"`
		Status          string `json:"status"`
		OrigQty         string `json:"origQty"`
		Price           string `json:"price"`
		ExecutedQty     string `json:"executedQty"`
		CummulativeQty  string `json:"cummulativeQuoteQty"`
		Time            int64  `json:"time"`
	}
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, fmt.Errorf("parse order: %w", err)
	}
	avgPrice := decimal.Zero
	if qty := decimal.RequireFromString(r.ExecutedQty); !qty.IsZero() {
		cumQty := decimal.RequireFromString(r.CummulativeQty)
		avgPrice = cumQty.Div(qty)
	}
	return &exchange.Order{
		ExchangeOrderID: strconv.FormatInt(r.OrderID, 10),
		ClientOID:       r.ClientOrderID,
		Symbol:          r.Symbol,
		Side:            mapSideBack(r.Side),
		Type:            mapOrderTypeBack(r.Type),
		Status:          mapStatus(r.Status),
		Quantity:        decimal.RequireFromString(r.OrigQty),
		Price:           decimal.RequireFromString(r.Price),
		FilledQty:       decimal.RequireFromString(r.ExecutedQty),
		AvgPrice:        avgPrice,
		CreatedAt:       time.UnixMilli(r.Time),
	}, nil
}

func mapSide(side string) string {
	if side == "sell" {
		return "SELL"
	}
	return "BUY"
}
func mapSideBack(side string) string {
	if side == "SELL" {
		return "sell"
	}
	return "buy"
}
func mapOrderType(t string) string {
	switch t {
	case "limit":
		return "LIMIT"
	case "stop_limit":
		return "STOP_LOSS_LIMIT"
	default:
		return "MARKET"
	}
}
func mapOrderTypeBack(t string) string {
	switch t {
	case "LIMIT":
		return "limit"
	case "STOP_LOSS_LIMIT":
		return "stop_limit"
	default:
		return "market"
	}
}
func mapStatus(s string) string {
	switch s {
	case "NEW":
		return "open"
	case "FILLED":
		return "filled"
	case "CANCELED":
		return "cancelled"
	case "PARTIALLY_FILLED":
		return "open"
	case "REJECTED":
		return "rejected"
	default:
		return "pending"
	}
}
