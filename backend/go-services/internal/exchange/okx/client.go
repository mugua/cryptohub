// Package okx implements the ExchangeAdapter for OKX using HMAC-SHA256 + timestamp signatures.
// okx 包使用 HMAC-SHA256 + 时间戳签名实现 OKX 的 ExchangeAdapter
package okx

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"go.uber.org/zap"
)

const defaultOKXBaseURL = "https://www.okx.com"

// Client is an authenticated OKX REST API client.
// Client 是经过认证的 OKX REST API 客户端
type Client struct {
	apiKey     string
	secretKey  string
	passphrase string
	baseURL    string
	http       *http.Client
	log        *zap.Logger
}

// NewClient creates a new OKX client.
// NewClient 创建新的 OKX 客户端
func NewClient(apiKey, secretKey, passphrase, baseURL string, log *zap.Logger) *Client {
	if baseURL == "" {
		baseURL = defaultOKXBaseURL
	}
	return &Client{
		apiKey:     apiKey,
		secretKey:  secretKey,
		passphrase: passphrase,
		baseURL:    baseURL,
		http:       &http.Client{Timeout: 10 * time.Second},
		log:        log,
	}
}

// sign generates the OKX signature: base64(HMAC-SHA256(timestamp+method+path+body)).
// sign 生成 OKX 签名：base64(HMAC-SHA256(timestamp+method+path+body))
func (c *Client) sign(timestamp, method, path, body string) string {
	prehash := timestamp + method + path + body
	mac := hmac.New(sha256.New, []byte(c.secretKey))
	mac.Write([]byte(prehash))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// doRequest executes an authenticated HTTP request to the OKX API.
// doRequest 向 OKX API 执行经过认证的 HTTP 请求
func (c *Client) doRequest(ctx context.Context, method, path string, body interface{}) ([]byte, error) {
	var bodyBytes []byte
	var err error
	if body != nil {
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("marshal body: %w", err)
		}
	}
	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05.999Z")
	sig := c.sign(timestamp, method, path, string(bodyBytes))

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("OK-ACCESS-KEY", c.apiKey)
	req.Header.Set("OK-ACCESS-SIGN", sig)
	req.Header.Set("OK-ACCESS-TIMESTAMP", timestamp)
	req.Header.Set("OK-ACCESS-PASSPHRASE", c.passphrase)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}
	// OKX returns code "0" for success.
	var envelope struct {
		Code string          `json:"code"`
		Msg  string          `json:"msg"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(respBody, &envelope); err != nil {
		return nil, fmt.Errorf("parse response: %w", err)
	}
	if envelope.Code != "0" {
		return nil, fmt.Errorf("OKX API error %s: %s", envelope.Code, envelope.Msg)
	}
	return envelope.Data, nil
}
