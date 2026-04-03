package okx

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/shopspring/decimal"

	"github.com/cryptohub/backend/internal/exchange"
)

// FuturesClient wraps Client with OKX swap/futures methods.
// FuturesClient 封装 Client 提供 OKX 永续合约/期货方法
type FuturesClient struct {
	*Client
}

// NewFuturesClient creates an OKX futures client.
func NewFuturesClient(apiKey, secretKey, passphrase, baseURL string) *FuturesClient {
	return &FuturesClient{Client: NewClient(apiKey, secretKey, passphrase, baseURL, nil)}
}

// PlaceOrder places a futures/swap order on OKX.
// PlaceOrder 在 OKX 上提交永续合约/期货订单
func (f *FuturesClient) PlaceOrder(ctx context.Context, req *exchange.OrderRequest) (*exchange.Order, error) {
	payload := map[string]interface{}{
		"instId":  req.Symbol,
		"tdMode":  "cross",
		"side":    req.Side,
		"ordType": mapOKXOrderType(req.Type),
		"sz":      req.Quantity.String(),
	}
	if !req.Price.IsZero() {
		payload["px"] = req.Price.String()
	}
	data, err := f.doRequest(ctx, http.MethodPost, "/api/v5/trade/order", payload)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		OrdId string `json:"ordId"`
		SCode string `json:"sCode"`
		SMsg  string `json:"sMsg"`
	}
	if err := json.Unmarshal(data, &raws); err != nil || len(raws) == 0 {
		return nil, fmt.Errorf("parse futures order response")
	}
	if raws[0].SCode != "0" {
		return nil, fmt.Errorf("OKX futures order error %s: %s", raws[0].SCode, raws[0].SMsg)
	}
	return &exchange.Order{
		ExchangeOrderID: raws[0].OrdId,
		Symbol:          req.Symbol,
		Side:            req.Side,
		Status:          "open",
	}, nil
}

// GetPositions returns all open OKX swap positions.
// GetPositions 返回所有开放的 OKX 永续合约仓位
func (f *FuturesClient) GetPositions(ctx context.Context) ([]*exchange.Position, error) {
	data, err := f.doRequest(ctx, http.MethodGet, "/api/v5/account/positions?instType=SWAP", nil)
	if err != nil {
		return nil, err
	}
	var raws []struct {
		InstId    string `json:"instId"`
		PosSide   string `json:"posSide"`
		Pos       string `json:"pos"`
		AvgPx     string `json:"avgPx"`
		MarkPx    string `json:"markPx"`
		LiqPx     string `json:"liqPx"`
		UplRatio  string `json:"uplRatio"`
		Upl       string `json:"upl"`
		Imr       string `json:"imr"`
		Lever     string `json:"lever"`
	}
	if err := json.Unmarshal(data, &raws); err != nil {
		return nil, err
	}
	positions := make([]*exchange.Position, 0)
	for _, r := range raws {
		qty := decimal.RequireFromString(r.Pos)
		if qty.IsZero() {
			continue
		}
		lev := 0
		fmt.Sscanf(r.Lever, "%d", &lev)
		pos := &exchange.Position{
			Symbol:        r.InstId,
			Side:          r.PosSide,
			Leverage:      lev,
			EntryPrice:    decimal.RequireFromString(r.AvgPx),
			MarkPrice:     decimal.RequireFromString(r.MarkPx),
			LiqPrice:      decimal.RequireFromString(r.LiqPx),
			Quantity:      qty.Abs(),
			Margin:        decimal.RequireFromString(r.Imr),
			UnrealizedPnL: decimal.RequireFromString(r.Upl),
		}
		positions = append(positions, pos)
	}
	return positions, nil
}

// SetLeverage sets the leverage for an OKX instrument.
// SetLeverage 为 OKX 交易工具设置杠杆倍数
func (f *FuturesClient) SetLeverage(ctx context.Context, symbol string, leverage int) error {
	payload := map[string]interface{}{
		"instId":  symbol,
		"lever":   fmt.Sprintf("%d", leverage),
		"mgnMode": "cross",
	}
	_, err := f.doRequest(ctx, http.MethodPost, "/api/v5/account/set-leverage", payload)
	return err
}
