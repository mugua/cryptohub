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

// FuturesClient implements futures trading on Binance USDM perpetual contracts.
// FuturesClient 实现 Binance USDM 永续合约的期货交易
type FuturesClient struct {
	*Client
}

// NewFuturesClient creates a FuturesClient for Binance futures.
// NewFuturesClient 创建 Binance 期货的 FuturesClient
func NewFuturesClient(apiKey, secretKey, baseURL string) *FuturesClient {
	if baseURL == "" {
		baseURL = "https://fapi.binance.com"
	}
	return &FuturesClient{Client: NewClient(apiKey, secretKey, baseURL, nil)}
}

// PlaceOrder submits a futures order.
// PlaceOrder 提交期货订单
func (f *FuturesClient) PlaceOrder(ctx context.Context, req *exchange.OrderRequest) (*exchange.Order, error) {
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
	body, err := f.doRequest(ctx, http.MethodPost, "/fapi/v1/order", params, true)
	if err != nil {
		return nil, err
	}
	return parseFuturesOrder(body)
}

// CancelOrder cancels an open futures order.
func (f *FuturesClient) CancelOrder(ctx context.Context, orderID, symbol string) error {
	params := url.Values{
		"symbol":  {symbol},
		"orderId": {orderID},
	}
	_, err := f.doRequest(ctx, http.MethodDelete, "/fapi/v1/order", params, true)
	return err
}

// GetPositions retrieves all open futures positions.
// GetPositions 获取所有开放的期货仓位
func (f *FuturesClient) GetPositions(ctx context.Context) ([]*exchange.Position, error) {
	body, err := f.doRequest(ctx, http.MethodGet, "/fapi/v2/positionRisk", nil, true)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		Symbol           string `json:"symbol"`
		PositionSide     string `json:"positionSide"`
		PositionAmt      string `json:"positionAmt"`
		EntryPrice       string `json:"entryPrice"`
		MarkPrice        string `json:"markPrice"`
		LiquidationPrice string `json:"liquidationPrice"`
		UnRealizedProfit string `json:"unRealizedProfit"`
		Leverage         string `json:"leverage"`
		IsolatedMargin   string `json:"isolatedMargin"`
	}
	if err := json.Unmarshal(body, &raws); err != nil {
		return nil, fmt.Errorf("parse positions: %w", err)
	}
	positions := make([]*exchange.Position, 0)
	for _, r := range raws {
		qty := decimal.RequireFromString(r.PositionAmt)
		if qty.IsZero() {
			continue
		}
		lev, _ := strconv.Atoi(r.Leverage)
		pos := &exchange.Position{
			Symbol:        r.Symbol,
			Side:          mapPositionSide(r.PositionSide, qty),
			Leverage:      lev,
			EntryPrice:    decimal.RequireFromString(r.EntryPrice),
			MarkPrice:     decimal.RequireFromString(r.MarkPrice),
			LiqPrice:      decimal.RequireFromString(r.LiquidationPrice),
			Quantity:      qty.Abs(),
			Margin:        decimal.RequireFromString(r.IsolatedMargin),
			UnrealizedPnL: decimal.RequireFromString(r.UnRealizedProfit),
		}
		positions = append(positions, pos)
	}
	return positions, nil
}

// SetLeverage sets the leverage for a symbol.
// SetLeverage 为指定交易对设置杠杆倍数
func (f *FuturesClient) SetLeverage(ctx context.Context, symbol string, leverage int) error {
	params := url.Values{
		"symbol":   {symbol},
		"leverage": {strconv.Itoa(leverage)},
	}
	_, err := f.doRequest(ctx, http.MethodPost, "/fapi/v1/leverage", params, true)
	return err
}

// GetBalance returns futures wallet balances.
func (f *FuturesClient) GetBalance(ctx context.Context) (map[string]decimal.Decimal, error) {
	body, err := f.doRequest(ctx, http.MethodGet, "/fapi/v2/balance", nil, true)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		Asset            string `json:"asset"`
		AvailableBalance string `json:"availableBalance"`
	}
	if err := json.Unmarshal(body, &raws); err != nil {
		return nil, err
	}
	balances := make(map[string]decimal.Decimal)
	for _, b := range raws {
		bal := decimal.RequireFromString(b.AvailableBalance)
		if !bal.IsZero() {
			balances[b.Asset] = bal
		}
	}
	return balances, nil
}

func parseFuturesOrder(data []byte) (*exchange.Order, error) {
	var r struct {
		OrderID       int64  `json:"orderId"`
		ClientOrderID string `json:"clientOrderId"`
		Symbol        string `json:"symbol"`
		Side          string `json:"side"`
		Type          string `json:"type"`
		Status        string `json:"status"`
		OrigQty       string `json:"origQty"`
		Price         string `json:"price"`
		ExecutedQty   string `json:"executedQty"`
		AvgPrice      string `json:"avgPrice"`
		UpdateTime    int64  `json:"updateTime"`
	}
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, err
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
		AvgPrice:        decimal.RequireFromString(r.AvgPrice),
		CreatedAt:       time.UnixMilli(r.UpdateTime),
	}, nil
}

func mapPositionSide(side string, qty decimal.Decimal) string {
	if side == "SHORT" {
		return "short"
	}
	if side == "LONG" {
		return "long"
	}
	// BOTH mode: positive qty = long
	if qty.IsPositive() {
		return "long"
	}
	return "short"
}
