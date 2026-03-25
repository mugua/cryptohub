// Package handlers provides all HTTP route handlers for the CryptoHub API.
package handlers

import (
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"cryptohub/go-core/internal/models"
)

// ─── Health ──────────────────────────────────────────────────────────────────

// Health returns a simple liveness response.
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "cryptohub-go-core",
		"time":    time.Now().UTC(),
	})
}

// ─── Market ──────────────────────────────────────────────────────────────────

// GetTickers returns simulated ticker data for major pairs.
func GetTickers(c *gin.Context) {
	prices := map[string]float64{
		"BTC/USDT": 67420, "ETH/USDT": 3540, "BNB/USDT": 582,
		"SOL/USDT": 178, "XRP/USDT": 0.62, "DOGE/USDT": 0.18,
	}
	tickers := make([]models.Ticker, 0, len(prices))
	for sym, price := range prices {
		tickers = append(tickers, models.Ticker{
			Symbol:    sym,
			Price:     price * (1 + (rand.Float64()-0.5)*0.002),
			Change24h: (rand.Float64() - 0.4) * price * 0.03,
			ChangePct: (rand.Float64() - 0.4) * 3,
			High24h:   price * 1.025,
			Low24h:    price * 0.975,
			Volume24h: rand.Float64()*4e9 + 1e8,
			Timestamp: time.Now().UnixMilli(),
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": tickers})
}

// GetCandles returns simulated OHLCV candles.
func GetCandles(c *gin.Context) {
	symbol := c.Param("symbol")
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 500 {
		limit = 100
	}

	basePrices := map[string]float64{
		"BTC/USDT": 67420, "ETH/USDT": 3540, "BNB/USDT": 582,
		"SOL/USDT": 178, "XRP/USDT": 0.62,
	}
	base, ok := basePrices[symbol]
	if !ok {
		base = 100
	}

	candles := make([]models.Candle, 0, limit)
	price := base * 0.9
	now := time.Now()
	intervalMs := int64(3_600_000)
	for i := limit; i >= 0; i-- {
		open := price
		change := (rand.Float64() - 0.48) * base * 0.015
		close := open + change
		if close < 0.01 {
			close = 0.01
		}
		high := max(open, close) * (1 + rand.Float64()*0.008)
		low := min(open, close) * (1 - rand.Float64()*0.008)
		candles = append(candles, models.Candle{
			Time:   now.UnixMilli() - int64(i)*intervalMs,
			Open:   round4(open),
			High:   round4(high),
			Low:    round4(low),
			Close:  round4(close),
			Volume: round4(base * (rand.Float64()*4500 + 500)),
		})
		price = close
	}
	c.JSON(http.StatusOK, gin.H{"data": candles})
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

// GetPortfolio returns the user's portfolio snapshot.
func GetPortfolio(c *gin.Context) {
	portfolio := models.Portfolio{
		TotalUSDValue: 98420.35,
		DailyPnL:      1248.6,
		DailyPnLPct:   1.28,
		Assets: []models.Asset{
			{Coin: "BTC", Balance: 1.24, Available: 1.0, Frozen: 0.24, USDValue: 83641},
			{Coin: "ETH", Balance: 3.5, Available: 3.5, Frozen: 0, USDValue: 12390},
			{Coin: "USDT", Balance: 2389.35, Available: 2389.35, Frozen: 0, USDValue: 2389.35},
		},
		Positions: []models.Position{
			{Symbol: "BTC/USDT", Side: "long", Size: 0.5, EntryPrice: 64800, MarkPrice: 67420, UnrealizedPnL: 1310, Leverage: 5},
			{Symbol: "ETH/USDT", Side: "long", Size: 2, EntryPrice: 3400, MarkPrice: 3540, UnrealizedPnL: 280, Leverage: 3},
		},
	}
	c.JSON(http.StatusOK, gin.H{"data": portfolio})
}

// ─── Strategies ───────────────────────────────────────────────────────────────

// ListStrategies returns all strategies for the authenticated user.
func ListStrategies(c *gin.Context) {
	now := time.Now()
	strategies := []models.Strategy{
		{
			ID: "s1", Name: "BTC 网格策略", Type: "grid", Symbol: "BTC/USDT",
			Exchange: "binance", Status: models.StrategyRunning,
			PnL: 1248.6, PnLPct: 4.2, WinRate: 68, TotalTrades: 142,
			Params:    map[string]any{"lower": 60000, "upper": 70000, "grids": 20},
			CreatedAt: now.Add(-60 * 24 * time.Hour), UpdatedAt: now, LastRunAt: &now,
		},
		{
			ID: "s2", Name: "ETH DCA策略", Type: "dca", Symbol: "ETH/USDT",
			Exchange: "okx", Status: models.StrategyRunning,
			PnL: 420.8, PnLPct: 2.8, WinRate: 72, TotalTrades: 36,
			Params:    map[string]any{"amount": 100, "interval": "1d"},
			CreatedAt: now.Add(-70 * 24 * time.Hour), UpdatedAt: now, LastRunAt: &now,
		},
	}
	c.JSON(http.StatusOK, gin.H{"data": strategies})
}

// GetStrategy returns a single strategy by ID.
func GetStrategy(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"id": id, "status": "not_implemented_yet"}})
}

// CreateStrategy creates a new strategy.
func CreateStrategy(c *gin.Context) {
	var s models.Strategy
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s.ID = strconv.FormatInt(time.Now().UnixNano(), 36)
	s.Status = models.StrategyStopped
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, gin.H{"data": s})
}

// UpdateStrategyStatus toggles a strategy on/off.
func UpdateStrategyStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status models.StrategyStatus `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"id": id, "status": req.Status}})
}

// DeleteStrategy removes a strategy.
func DeleteStrategy(c *gin.Context) {
	id := c.Param("id")
	_ = id
	c.JSON(http.StatusOK, gin.H{"message": "strategy deleted"})
}

// ─── Orders ──────────────────────────────────────────────────────────────────

// ListOrders returns recent orders.
func ListOrders(c *gin.Context) {
	orders := make([]models.Order, 0)
	statuses := []models.OrderStatus{models.OrderFilled, models.OrderOpen, models.OrderCancelled}
	symbols := []string{"BTC/USDT", "ETH/USDT", "SOL/USDT"}
	for i := 0; i < 20; i++ {
		ts := time.Now().Add(-time.Duration(i) * time.Hour)
		orders = append(orders, models.Order{
			ID:             strconv.Itoa(i + 1),
			Exchange:       map[int]string{0: "binance", 1: "okx"}[i%2],
			Symbol:         symbols[i%3],
			Side:           map[int]models.OrderSide{0: models.Buy, 1: models.Sell}[i%2],
			Type:           models.Limit,
			Quantity:       round4(rand.Float64() * 0.5),
			FilledQuantity: round4(rand.Float64() * 0.5),
			Status:         statuses[i%3],
			CreatedAt:      ts,
			UpdatedAt:      ts.Add(30 * time.Minute),
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

// PlaceOrder places a new order.
func PlaceOrder(c *gin.Context) {
	var order models.Order
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	order.ID = strconv.FormatInt(time.Now().UnixNano(), 36)
	order.Status = models.OrderOpen
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	c.JSON(http.StatusCreated, gin.H{"data": order})
}

// CancelOrder cancels an open order.
func CancelOrder(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"id": id, "status": models.OrderCancelled}})
}

// ─── Exchange Accounts ────────────────────────────────────────────────────────

// ListExchangeAccounts returns all linked exchange accounts.
func ListExchangeAccounts(c *gin.Context) {
	now := time.Now()
	accounts := []models.ExchangeAccount{
		{
			ID: "e1", Exchange: "binance", Label: "主账户 (Binance)",
			APIKey: "xxxxxx****xxxx", IsConnected: true,
			Permissions: []string{"read", "trade"}, CreatedAt: now.Add(-120 * 24 * time.Hour), LastSyncAt: &now,
		},
		{
			ID: "e2", Exchange: "okx", Label: "OKX 量化账户",
			APIKey: "yyyyyy****yyyy", IsConnected: true,
			Permissions: []string{"read", "trade", "withdraw"}, CreatedAt: now.Add(-100 * 24 * time.Hour), LastSyncAt: &now,
		},
	}
	c.JSON(http.StatusOK, gin.H{"data": accounts})
}

// AddExchangeAccount adds a new exchange API key.
func AddExchangeAccount(c *gin.Context) {
	var acc models.ExchangeAccount
	if err := c.ShouldBindJSON(&acc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	acc.ID = strconv.FormatInt(time.Now().UnixNano(), 36)
	acc.IsConnected = false
	acc.CreatedAt = time.Now()
	// Mask the API key
	if len(acc.APIKey) > 10 {
		acc.APIKey = acc.APIKey[:6] + "****" + acc.APIKey[len(acc.APIKey)-4:]
	}
	c.JSON(http.StatusCreated, gin.H{"data": acc})
}

// DeleteExchangeAccount removes an exchange account.
func DeleteExchangeAccount(c *gin.Context) {
	id := c.Param("id")
	_ = id
	c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func round4(v float64) float64 {
	return float64(int(v*10000)) / 10000
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
