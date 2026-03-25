// Package exchange defines the interface and factory for exchange connectors.
package exchange

import (
	"context"

	"cryptohub/go-core/internal/models"
)

// Exchange is the common interface all exchange connectors must implement.
type Exchange interface {
	// Name returns the exchange identifier (e.g. "binance").
	Name() string

	// FetchTicker returns the latest price snapshot for a symbol.
	FetchTicker(ctx context.Context, symbol string) (*models.Ticker, error)

	// FetchCandles returns OHLCV bars for the given symbol and interval.
	FetchCandles(ctx context.Context, symbol, interval string, limit int) ([]models.Candle, error)

	// FetchPortfolio returns the account's asset & position snapshot.
	FetchPortfolio(ctx context.Context) (*models.Portfolio, error)

	// PlaceOrder submits a new order to the exchange.
	PlaceOrder(ctx context.Context, order *models.Order) (*models.Order, error)

	// CancelOrder cancels an open order by its exchange-side ID.
	CancelOrder(ctx context.Context, orderID string) error

	// FetchOrder retrieves the latest status of an order.
	FetchOrder(ctx context.Context, orderID string) (*models.Order, error)
}

// Factory creates Exchange instances by name.
type Factory struct {
	connectors map[string]Exchange
}

// NewFactory returns an empty Factory.
func NewFactory() *Factory {
	return &Factory{connectors: make(map[string]Exchange)}
}

// Register adds a connector under the given name.
func (f *Factory) Register(name string, ex Exchange) {
	f.connectors[name] = ex
}

// Get returns a connector by name or (nil, false) if not found.
func (f *Factory) Get(name string) (Exchange, bool) {
	ex, ok := f.connectors[name]
	return ex, ok
}

// ─── Binance connector stub ───────────────────────────────────────────────────

// BinanceConnector is a stub for the Binance exchange connector.
// Replace with real REST/WebSocket calls in production.
type BinanceConnector struct {
	apiKey    string
	secretKey string
}

// NewBinance creates a new Binance connector.
func NewBinance(apiKey, secretKey string) *BinanceConnector {
	return &BinanceConnector{apiKey: apiKey, secretKey: secretKey}
}

func (b *BinanceConnector) Name() string { return "binance" }

func (b *BinanceConnector) FetchTicker(_ context.Context, _ string) (*models.Ticker, error) {
	// TODO: call GET /api/v3/ticker/24hr
	return &models.Ticker{Symbol: "BTC/USDT", Price: 67420}, nil
}

func (b *BinanceConnector) FetchCandles(_ context.Context, _, _ string, _ int) ([]models.Candle, error) {
	// TODO: call GET /api/v3/klines
	return nil, nil
}

func (b *BinanceConnector) FetchPortfolio(_ context.Context) (*models.Portfolio, error) {
	// TODO: call GET /api/v3/account
	return &models.Portfolio{}, nil
}

func (b *BinanceConnector) PlaceOrder(_ context.Context, order *models.Order) (*models.Order, error) {
	// TODO: call POST /api/v3/order
	order.Status = models.OrderOpen
	return order, nil
}

func (b *BinanceConnector) CancelOrder(_ context.Context, _ string) error {
	// TODO: call DELETE /api/v3/order
	return nil
}

func (b *BinanceConnector) FetchOrder(_ context.Context, _ string) (*models.Order, error) {
	// TODO: call GET /api/v3/order
	return nil, nil
}

// ─── OKX connector stub ──────────────────────────────────────────────────────

// OKXConnector is a stub for the OKX exchange connector.
type OKXConnector struct {
	apiKey     string
	secretKey  string
	passphrase string
}

// NewOKX creates a new OKX connector.
func NewOKX(apiKey, secretKey, passphrase string) *OKXConnector {
	return &OKXConnector{apiKey: apiKey, secretKey: secretKey, passphrase: passphrase}
}

func (o *OKXConnector) Name() string { return "okx" }

func (o *OKXConnector) FetchTicker(_ context.Context, _ string) (*models.Ticker, error) {
	// TODO: call GET /api/v5/market/ticker
	return &models.Ticker{Symbol: "BTC/USDT", Price: 67420}, nil
}

func (o *OKXConnector) FetchCandles(_ context.Context, _, _ string, _ int) ([]models.Candle, error) {
	// TODO: call GET /api/v5/market/candles
	return nil, nil
}

func (o *OKXConnector) FetchPortfolio(_ context.Context) (*models.Portfolio, error) {
	// TODO: call GET /api/v5/account/balance
	return &models.Portfolio{}, nil
}

func (o *OKXConnector) PlaceOrder(_ context.Context, order *models.Order) (*models.Order, error) {
	// TODO: call POST /api/v5/trade/order
	order.Status = models.OrderOpen
	return order, nil
}

func (o *OKXConnector) CancelOrder(_ context.Context, _ string) error {
	// TODO: call POST /api/v5/trade/cancel-order
	return nil
}

func (o *OKXConnector) FetchOrder(_ context.Context, _ string) (*models.Order, error) {
	// TODO: call GET /api/v5/trade/order
	return nil, nil
}
