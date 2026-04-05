// Package binance implements the ExchangeAdapter for Binance using HMAC-SHA256 authentication.
// binance 包使用 HMAC-SHA256 认证实现 Binance 的 ExchangeAdapter
package binance

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
	"sync"
	"time"

	"go.uber.org/zap"
)

const (
	defaultBaseURL = "https://api.binance.com"
	defaultTimeout = 10 * time.Second
	// Binance allows 1200 request weight per minute on the general endpoint.
	// Binance 通用端点每分钟允许 1200 请求权重
	requestWeightPerMin = 1200
)

// Client is an authenticated Binance REST API client.
// Client 是经过认证的 Binance REST API 客户端
type Client struct {
	apiKey    string
	secretKey string
	baseURL   string
	http      *http.Client
	log       *zap.Logger

	// rate limiter fields / 速率限制字段
	mu          sync.Mutex
	weightUsed  int
	windowReset time.Time
}

// NewClient creates a new Binance client with HMAC-SHA256 signing.
// NewClient 创建具有 HMAC-SHA256 签名功能的新 Binance 客户端
func NewClient(apiKey, secretKey, baseURL string, log *zap.Logger) *Client {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	return &Client{
		apiKey:      apiKey,
		secretKey:   secretKey,
		baseURL:     baseURL,
		http:        &http.Client{Timeout: defaultTimeout},
		log:         log,
		windowReset: time.Now().Add(time.Minute),
	}
}

// sign appends timestamp and signature to query parameters.
// sign 向查询参数中追加时间戳和签名
func (c *Client) sign(params url.Values) url.Values {
	params.Set("timestamp", strconv.FormatInt(time.Now().UnixMilli(), 10))
	mac := hmac.New(sha256.New, []byte(c.secretKey))
	mac.Write([]byte(params.Encode()))
	params.Set("signature", hex.EncodeToString(mac.Sum(nil)))
	return params
}

// doRequest executes an HTTP request to the Binance API.
// doRequest 向 Binance API 执行 HTTP 请求
func (c *Client) doRequest(ctx context.Context, method, path string, params url.Values, signed bool) ([]byte, error) {
	if err := c.checkRateLimit(); err != nil {
		return nil, err
	}
	if params == nil {
		params = url.Values{}
	}
	if signed {
		params = c.sign(params)
	}
	reqURL := c.baseURL + path
	var req *http.Request
	var err error
	if method == http.MethodGet || method == http.MethodDelete {
		if len(params) > 0 {
			reqURL += "?" + params.Encode()
		}
		req, err = http.NewRequestWithContext(ctx, method, reqURL, nil)
	} else {
		req, err = http.NewRequestWithContext(ctx, method, reqURL, nil)
		if err == nil {
			req.URL.RawQuery = params.Encode()
		}
	}
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("X-MBX-APIKEY", c.apiKey)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}
	if resp.StatusCode >= 400 {
		var apiErr struct {
			Code int    `json:"code"`
			Msg  string `json:"msg"`
		}
		_ = json.Unmarshal(body, &apiErr)
		return nil, fmt.Errorf("binance API error %d: %s", apiErr.Code, apiErr.Msg)
	}
	return body, nil
}

// checkRateLimit enforces client-side weight tracking.
// checkRateLimit 执行客户端权重跟踪
func (c *Client) checkRateLimit() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	now := time.Now()
	if now.After(c.windowReset) {
		c.weightUsed = 0
		c.windowReset = now.Add(time.Minute)
	}
	if c.weightUsed >= requestWeightPerMin {
		wait := c.windowReset.Sub(now)
		return fmt.Errorf("rate limit reached, retry after %s", wait)
	}
	c.weightUsed++
	return nil
}
