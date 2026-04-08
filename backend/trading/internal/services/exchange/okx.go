package exchange

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

const okxBaseURL = "https://www.okx.com"

type OKXExchange struct {
	apiKey     string
	secretKey  string
	passphrase string
	client     *http.Client
}

func NewOKXExchange(apiKey, secretKey, passphrase string) *OKXExchange {
	return &OKXExchange{
		apiKey:     apiKey,
		secretKey:  secretKey,
		passphrase: passphrase,
		client:     &http.Client{Timeout: 10 * time.Second},
	}
}

func (o *OKXExchange) signRequest(timestamp, method, path, body string) string {
	message := timestamp + method + path + body
	mac := hmac.New(sha256.New, []byte(o.secretKey))
	mac.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

func (o *OKXExchange) doRequest(req *http.Request, body string) ([]byte, error) {
	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
	sign := o.signRequest(timestamp, req.Method, req.URL.Path+"?"+req.URL.RawQuery, body)

	req.Header.Set("OK-ACCESS-KEY", o.apiKey)
	req.Header.Set("OK-ACCESS-SIGN", sign)
	req.Header.Set("OK-ACCESS-TIMESTAMP", timestamp)
	req.Header.Set("OK-ACCESS-PASSPHRASE", o.passphrase)
	req.Header.Set("Content-Type", "application/json")

	resp, err := o.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("okx request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("okx API error (status %d): %s", resp.StatusCode, string(respBody))
	}
	return respBody, nil
}

func (o *OKXExchange) PlaceOrder(ctx context.Context, symbol, side, orderType string, quantity, price float64) (*OrderResult, error) {
	payload := map[string]interface{}{
		"instId":  symbol,
		"tdMode":  "cash",
		"side":    side,
		"ordType": orderType,
		"sz":      strconv.FormatFloat(quantity, 'f', -1, 64),
	}
	if price > 0 {
		payload["px"] = strconv.FormatFloat(price, 'f', -1, 64)
	}

	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, okxBaseURL+"/api/v5/trade/order", nil)
	if err != nil {
		return nil, err
	}

	respBody, err := o.doRequest(req, string(bodyBytes))
	if err != nil {
		return nil, err
	}

	var resp struct {
		Data []struct {
			OrdID string `json:"ordId"`
			SCode string `json:"sCode"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no order data in response")
	}

	return &OrderResult{
		OrderID: resp.Data[0].OrdID,
		Status:  "NEW",
	}, nil
}

func (o *OKXExchange) CancelOrder(ctx context.Context, symbol, orderID string) error {
	payload := map[string]string{
		"instId": symbol,
		"ordId":  orderID,
	}
	bodyBytes, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, okxBaseURL+"/api/v5/trade/cancel-order", nil)
	if err != nil {
		return err
	}
	_, err = o.doRequest(req, string(bodyBytes))
	return err
}

func (o *OKXExchange) GetOrderStatus(ctx context.Context, symbol, orderID string) (*OrderResult, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("%s/api/v5/trade/order?instId=%s&ordId=%s", okxBaseURL, symbol, orderID), nil)
	if err != nil {
		return nil, err
	}

	respBody, err := o.doRequest(req, "")
	if err != nil {
		return nil, err
	}

	var resp struct {
		Data []struct {
			OrdID  string `json:"ordId"`
			State  string `json:"state"`
			FillSz string `json:"fillSz"`
			FillPx string `json:"fillPx"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("order not found")
	}

	d := resp.Data[0]
	filledQty, _ := strconv.ParseFloat(d.FillSz, 64)
	filledPrice, _ := strconv.ParseFloat(d.FillPx, 64)

	return &OrderResult{
		OrderID:     d.OrdID,
		Status:      d.State,
		FilledQty:   filledQty,
		FilledPrice: filledPrice,
	}, nil
}

func (o *OKXExchange) GetBalance(ctx context.Context, asset string) (*BalanceInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("%s/api/v5/account/balance?ccy=%s", okxBaseURL, asset), nil)
	if err != nil {
		return nil, err
	}

	respBody, err := o.doRequest(req, "")
	if err != nil {
		return nil, err
	}

	var resp struct {
		Data []struct {
			Details []struct {
				Ccy       string `json:"ccy"`
				AvailBal  string `json:"availBal"`
				FrozenBal string `json:"frozenBal"`
			} `json:"details"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	if len(resp.Data) > 0 {
		for _, d := range resp.Data[0].Details {
			if d.Ccy == asset {
				avail, _ := strconv.ParseFloat(d.AvailBal, 64)
				frozen, _ := strconv.ParseFloat(d.FrozenBal, 64)
				return &BalanceInfo{Asset: asset, Available: avail, Locked: frozen}, nil
			}
		}
	}
	return &BalanceInfo{Asset: asset, Available: 0, Locked: 0}, nil
}

func (o *OKXExchange) GetTicker(ctx context.Context, symbol string) (*TickerInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("%s/api/v5/market/ticker?instId=%s", okxBaseURL, symbol), nil)
	if err != nil {
		return nil, err
	}

	respBody, err := o.doRequest(req, "")
	if err != nil {
		return nil, err
	}

	var resp struct {
		Data []struct {
			InstID  string `json:"instId"`
			Last    string `json:"last"`
			BidPx   string `json:"bidPx"`
			AskPx   string `json:"askPx"`
			Vol24h  string `json:"vol24h"`
		} `json:"data"`
	}
	if err := json.Unmarshal(respBody, &resp); err != nil {
		return nil, fmt.Errorf("parsing response: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("ticker not found")
	}

	d := resp.Data[0]
	last, _ := strconv.ParseFloat(d.Last, 64)
	bid, _ := strconv.ParseFloat(d.BidPx, 64)
	ask, _ := strconv.ParseFloat(d.AskPx, 64)
	vol, _ := strconv.ParseFloat(d.Vol24h, 64)

	return &TickerInfo{
		Symbol:    symbol,
		LastPrice: last,
		BidPrice:  bid,
		AskPrice:  ask,
		Volume:    vol,
	}, nil
}
