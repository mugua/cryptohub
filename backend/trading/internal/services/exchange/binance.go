package exchange

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const binanceBaseURL = "https://api.binance.com"

type BinanceExchange struct {
	apiKey    string
	secretKey string
	client    *http.Client
}

func NewBinanceExchange(apiKey, secretKey string) *BinanceExchange {
	return &BinanceExchange{
		apiKey:    apiKey,
		secretKey: secretKey,
		client:    &http.Client{Timeout: 10 * time.Second},
	}
}

func (b *BinanceExchange) sign(params url.Values) string {
	mac := hmac.New(sha256.New, []byte(b.secretKey))
	mac.Write([]byte(params.Encode()))
	return hex.EncodeToString(mac.Sum(nil))
}

func (b *BinanceExchange) doRequest(req *http.Request) ([]byte, error) {
	req.Header.Set("X-MBX-APIKEY", b.apiKey)
	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("binance request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("binance API error (status %d): %s", resp.StatusCode, string(body))
	}
	return body, nil
}

func (b *BinanceExchange) PlaceOrder(ctx context.Context, symbol, side, orderType string, quantity, price float64) (*OrderResult, error) {
	params := url.Values{}
	params.Set("symbol", symbol)
	params.Set("side", side)
	params.Set("type", orderType)
	params.Set("quantity", strconv.FormatFloat(quantity, 'f', -1, 64))
	if price > 0 {
		params.Set("price", strconv.FormatFloat(price, 'f', -1, 64))
		params.Set("timeInForce", "GTC")
	}
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	params.Set("signature", b.sign(params))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, binanceBaseURL+"/api/v3/order?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}

	body, err := b.doRequest(req)
	if err != nil {
		return nil, err
	}

	var resp struct {
		OrderID       int64  `json:"orderId"`
		Status        string `json:"status"`
		ExecutedQty   string `json:"executedQty"`
		CummulativeQP string `json:"cummulativeQuoteQty"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	filledQty, _ := strconv.ParseFloat(resp.ExecutedQty, 64)
	filledPrice := 0.0
	if filledQty > 0 {
		quoteQty, _ := strconv.ParseFloat(resp.CummulativeQP, 64)
		filledPrice = quoteQty / filledQty
	}

	return &OrderResult{
		OrderID:     strconv.FormatInt(resp.OrderID, 10),
		Status:      resp.Status,
		FilledQty:   filledQty,
		FilledPrice: filledPrice,
	}, nil
}

func (b *BinanceExchange) CancelOrder(ctx context.Context, symbol, orderID string) error {
	params := url.Values{}
	params.Set("symbol", symbol)
	params.Set("orderId", orderID)
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	params.Set("signature", b.sign(params))

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, binanceBaseURL+"/api/v3/order?"+params.Encode(), nil)
	if err != nil {
		return err
	}
	_, err = b.doRequest(req)
	return err
}

func (b *BinanceExchange) GetOrderStatus(ctx context.Context, symbol, orderID string) (*OrderResult, error) {
	params := url.Values{}
	params.Set("symbol", symbol)
	params.Set("orderId", orderID)
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	params.Set("signature", b.sign(params))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, binanceBaseURL+"/api/v3/order?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}

	body, err := b.doRequest(req)
	if err != nil {
		return nil, err
	}

	var resp struct {
		OrderID     int64  `json:"orderId"`
		Status      string `json:"status"`
		ExecutedQty string `json:"executedQty"`
		Price       string `json:"price"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	filledQty, _ := strconv.ParseFloat(resp.ExecutedQty, 64)
	filledPrice, _ := strconv.ParseFloat(resp.Price, 64)

	return &OrderResult{
		OrderID:     strconv.FormatInt(resp.OrderID, 10),
		Status:      resp.Status,
		FilledQty:   filledQty,
		FilledPrice: filledPrice,
	}, nil
}

func (b *BinanceExchange) GetBalance(ctx context.Context, asset string) (*BalanceInfo, error) {
	params := url.Values{}
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	params.Set("signature", b.sign(params))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, binanceBaseURL+"/api/v3/account?"+params.Encode(), nil)
	if err != nil {
		return nil, err
	}

	body, err := b.doRequest(req)
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
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	for _, bal := range resp.Balances {
		if bal.Asset == asset {
			free, _ := strconv.ParseFloat(bal.Free, 64)
			locked, _ := strconv.ParseFloat(bal.Locked, 64)
			return &BalanceInfo{Asset: asset, Available: free, Locked: locked}, nil
		}
	}
	return &BalanceInfo{Asset: asset, Available: 0, Locked: 0}, nil
}

func (b *BinanceExchange) GetTicker(ctx context.Context, symbol string) (*TickerInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, binanceBaseURL+"/api/v3/ticker/bookTicker?symbol="+symbol, nil)
	if err != nil {
		return nil, err
	}

	body, err := b.doRequest(req)
	if err != nil {
		return nil, err
	}

	var resp struct {
		Symbol   string `json:"symbol"`
		BidPrice string `json:"bidPrice"`
		AskPrice string `json:"askPrice"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	bid, _ := strconv.ParseFloat(resp.BidPrice, 64)
	ask, _ := strconv.ParseFloat(resp.AskPrice, 64)
	return &TickerInfo{
		Symbol:    symbol,
		LastPrice: (bid + ask) / 2,
		BidPrice:  bid,
		AskPrice:  ask,
	}, nil
}
