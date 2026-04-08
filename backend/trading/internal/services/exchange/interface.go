package exchange

import "context"

type TickerInfo struct {
	Symbol    string  `json:"symbol"`
	LastPrice float64 `json:"last_price"`
	BidPrice  float64 `json:"bid_price"`
	AskPrice  float64 `json:"ask_price"`
	Volume    float64 `json:"volume"`
}

type BalanceInfo struct {
	Asset     string  `json:"asset"`
	Available float64 `json:"available"`
	Locked    float64 `json:"locked"`
}

type OrderResult struct {
	OrderID     string  `json:"order_id"`
	Status      string  `json:"status"`
	FilledQty   float64 `json:"filled_qty"`
	FilledPrice float64 `json:"filled_price"`
}

type Exchange interface {
	PlaceOrder(ctx context.Context, symbol, side, orderType string, quantity, price float64) (*OrderResult, error)
	CancelOrder(ctx context.Context, symbol, orderID string) error
	GetOrderStatus(ctx context.Context, symbol, orderID string) (*OrderResult, error)
	GetBalance(ctx context.Context, asset string) (*BalanceInfo, error)
	GetTicker(ctx context.Context, symbol string) (*TickerInfo, error)
}
