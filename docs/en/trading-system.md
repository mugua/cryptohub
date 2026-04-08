# Trading System Technical Documentation

## 1. Overview

The CryptoHub trading system is powered by a high-performance Go/Gin trading service. It supports multiple trading modes: manual trading, strategy-based trading (quantitative), and paper trading (simulation). Through a unified exchange interface abstraction layer, it seamlessly integrates with major exchanges like Binance and OKX. The built-in risk management module ensures trading safety, and the backtesting system allows users to validate strategy effectiveness before live trading.

---

## 2. Trading Flow

```
User places order
         ↓
┌─────────────────┐
│   Risk Check    │  Check position, leverage, daily loss limits
└────────┬────────┘
         ↓
┌─────────────────┐     ┌──────────────┐
│ Paper trade?    │─Yes──│  Paper Exec  │  Simulate fill, no exchange
└────────┬────────┘      └──────────────┘
         │No
         ↓
┌─────────────────┐
│  Route to       │  Route based on user's API config
│  Exchange       │
└────────┬────────┘
         ↓
┌─────────────────┐
│  Sign & Submit  │  HMAC-SHA256 signing, send REST request
└────────┬────────┘
         ↓
┌─────────────────┐
│  Record & Notify│  Save to DB, publish Kafka event, WS push
└─────────────────┘
```

---

## 3. Supported Order Types

| Type | Description | Use Case |
|---|---|---|
| `market` | Market order, executes immediately at current price | Quick entry/exit |
| `limit` | Limit order, queued at specified price | Precise price trading |
| `stop_loss` | Stop loss, auto-sell at threshold | Risk control |
| `take_profit` | Take profit, auto-sell at target | Lock profits |

---

## 4. Exchange Integration

### 4.1 Binance Integration

**Authentication:**
- HMAC-SHA256 signature
- Parameters sorted alphabetically, appended with `timestamp` and `signature`

**Key APIs:**
```
POST /api/v3/order          # Place order
DELETE /api/v3/order        # Cancel order
GET  /api/v3/order          # Query order
GET  /api/v3/account        # Account info
GET  /api/v3/ticker/price   # Current price
```

### 4.2 OKX Integration

**Authentication:**
- HMAC-SHA256 signature
- Custom headers: `OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`, `OK-ACCESS-PASSPHRASE`

**Key APIs:**
```
POST /api/v5/trade/order        # Place order
POST /api/v5/trade/cancel-order # Cancel order
GET  /api/v5/trade/order        # Query order
GET  /api/v5/account/balance    # Account balance
GET  /api/v5/market/ticker      # Market ticker
```

---

## 5. Risk Management

### 5.1 Risk Control Rules

| Check | Default Limit | Description |
|---|---|---|
| Max Position % | 10% of portfolio | Maximum single-coin position as percentage of total assets |
| Max Leverage | 20x | Maximum allowed leverage multiplier |
| Daily Loss Limit | 5% of portfolio | Maximum daily loss as percentage of total assets |
| Max Open Orders | 50 | Maximum number of simultaneously active orders |

### 5.2 Risk Check Flow

```go
func (r *RiskService) CheckOrder(order OrderRequest) error {
    // 1. Check position size
    if order.Quantity * order.Price > maxPositionValue {
        return ErrPositionTooLarge
    }
    // 2. Check leverage
    if order.Leverage > maxLeverage {
        return ErrLeverageTooHigh
    }
    // 3. Check daily loss
    if todayLoss + potentialLoss > dailyLossLimit {
        return ErrDailyLossExceeded
    }
    // 4. Check open orders
    if openOrderCount >= maxOpenOrders {
        return ErrTooManyOpenOrders
    }
    return nil  // Pass all checks
}
```

---

## 6. Backtesting System

### 6.1 Features

The backtesting system allows users to test trading strategy performance using historical market data. It simulates strategy trading behavior over a specified time period and calculates key performance metrics.

### 6.2 Performance Metrics

| Metric | Description |
|---|---|
| Total Return | (Final Capital - Initial Capital) / Initial Capital × 100% |
| Win Rate | Profitable Trades / Total Trades × 100% |
| Max Drawdown | Maximum peak-to-trough decline percentage |
| Sharpe Ratio | (Strategy Return - Risk-free Return) / Strategy Volatility |

### 6.3 Usage Example

```bash
# Run backtest
curl -X POST http://localhost:8001/api/v1/trading/backtest/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "strategy_id": "550e8400-e29b-41d4-a716-446655440000",
    "coin_symbol": "BTC",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2026-01-01T00:00:00Z",
    "initial_capital": 10000.0
  }'
```

---

## 7. WebSocket Real-time Data

### 7.1 Connection

```javascript
const ws = new WebSocket('ws://localhost:8001/ws/?token=<jwt_token>');
```

### 7.2 Subscribe Messages

```json
// Subscribe to ticker
{"type": "subscribe", "channel": "ticker", "symbol": "BTC"}

// Subscribe to order updates
{"type": "subscribe", "channel": "orders"}

// Subscribe to strategy signals
{"type": "subscribe", "channel": "signals"}
```

### 7.3 Push Message Format

```json
// Ticker update
{
  "channel": "ticker",
  "data": {
    "symbol": "BTC",
    "price": 67890.50,
    "change_24h": 2.35,
    "volume_24h": 28500000000,
    "timestamp": "2026-04-08T09:00:00Z"
  }
}

// Order filled
{
  "channel": "orders",
  "data": {
    "order_id": "...",
    "status": "filled",
    "filled_price": 67890.50,
    "filled_quantity": 0.1
  }
}
```

---

## 8. Strategy Types

| Type | Description |
|---|---|
| `grid` | Grid trading: auto-place orders within price range |
| `dca` | Dollar-cost averaging: periodic fixed-amount purchases |
| `momentum` | Momentum: follow price trends |
| `arbitrage` | Arbitrage: exploit exchange price differences |
| `custom` | Custom: user-written strategy code |
