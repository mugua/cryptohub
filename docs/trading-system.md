# 交易系统技术文档 / Trading System Technical Documentation

## 1. 概述 / Overview

**中文：**

CryptoHub 交易系统由 Go/Gin 构建的高性能交易服务提供支持。系统支持多种交易方式：手动交易、策略交易（量化交易）和虚拟盘交易（模拟盘）。通过统一的交易所接口抽象层，可以无缝对接 Binance、OKX 等主流交易所。内置风险管理模块确保交易安全，回测系统允许用户在真实下单前验证策略有效性。

**English:**

The CryptoHub trading system is powered by a high-performance Go/Gin trading service. It supports multiple trading modes: manual trading, strategy-based trading (quantitative), and paper trading (simulation). Through a unified exchange interface abstraction layer, it seamlessly integrates with major exchanges like Binance and OKX. The built-in risk management module ensures trading safety, and the backtesting system allows users to validate strategy effectiveness before live trading.

---

## 2. 交易流程 / Trading Flow

```
用户下单 / User places order
         ↓
┌─────────────────┐
│   风险检查       │  检查仓位、杠杆、日亏损限制
│   Risk Check    │  Check position, leverage, daily loss limits
└────────┬────────┘
         ↓
┌─────────────────┐     ┌──────────────┐
│ 虚拟盘？        │─Yes──│  虚拟执行     │  模拟成交，不连接交易所
│ Paper trade?    │      │  Paper Exec  │  Simulate fill, no exchange
└────────┬────────┘      └──────────────┘
         │No
         ↓
┌─────────────────┐
│  路由到交易所    │  根据用户API设置选择交易所
│  Route to       │  Route based on user's API config
│  Exchange       │
└────────┬────────┘
         ↓
┌─────────────────┐
│  签名 & 下单     │  HMAC-SHA256签名，发送REST请求
│  Sign & Submit  │  HMAC-SHA256 signing, send REST request
└────────┬────────┘
         ↓
┌─────────────────┐
│  记录 & 通知     │  保存订单到DB，发送Kafka事件，WebSocket推送
│  Record & Notify│  Save to DB, publish Kafka event, WS push
└─────────────────┘
```

---

## 3. 支持的订单类型 / Supported Order Types

| 类型 / Type | 说明 / Description | 使用场景 / Use Case |
|---|---|---|
| `market` | 市价单，以当前市场价格立即成交 / Market order, executes immediately | 快速进出场 / Quick entry/exit |
| `limit` | 限价单，指定价格挂单等待成交 / Limit order, queued at specified price | 精确价格交易 / Precise price trading |
| `stop_loss` | 止损单，价格触及阈值自动卖出 / Stop loss, auto-sell at threshold | 风险控制 / Risk control |
| `take_profit` | 止盈单，价格达到目标自动卖出 / Take profit, auto-sell at target | 锁定利润 / Lock profits |

---

## 4. 交易所集成 / Exchange Integration

### 4.1 Binance 接入 / Binance Integration

**认证方式 / Authentication:**
- HMAC-SHA256 签名 / HMAC-SHA256 signature
- 参数按字母排序拼接，附加 `timestamp` 和 `signature`
- Parameters sorted alphabetically, appended with `timestamp` and `signature`

**主要 API / Key APIs:**
```
POST /api/v3/order          # 下单 / Place order
DELETE /api/v3/order        # 撤单 / Cancel order
GET  /api/v3/order          # 查询订单 / Query order
GET  /api/v3/account        # 账户信息 / Account info
GET  /api/v3/ticker/price   # 当前价格 / Current price
```

### 4.2 OKX 接入 / OKX Integration

**认证方式 / Authentication:**
- HMAC-SHA256 签名 / HMAC-SHA256 signature
- 自定义请求头 / Custom headers: `OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`, `OK-ACCESS-PASSPHRASE`

**主要 API / Key APIs:**
```
POST /api/v5/trade/order        # 下单 / Place order
POST /api/v5/trade/cancel-order # 撤单 / Cancel order
GET  /api/v5/trade/order        # 查询订单 / Query order
GET  /api/v5/account/balance    # 账户余额 / Account balance
GET  /api/v5/market/ticker      # 行情数据 / Market ticker
```

---

## 5. 风险管理 / Risk Management

### 5.1 风控规则 / Risk Control Rules

| 检查项 / Check | 默认限制 / Default Limit | 说明 / Description |
|---|---|---|
| 最大仓位比例 / Max Position % | 10% of portfolio | 单币种最大持仓占总资产比例 |
| 最大杠杆 / Max Leverage | 20x | 最大允许杠杆倍数 |
| 日亏损限制 / Daily Loss Limit | 5% of portfolio | 单日最大亏损占总资产比例 |
| 最大挂单数 / Max Open Orders | 50 | 同时活跃的最大订单数 |

### 5.2 风控流程 / Risk Check Flow

```go
func (r *RiskService) CheckOrder(order OrderRequest) error {
    // 1. 检查仓位大小 / Check position size
    if order.Quantity * order.Price > maxPositionValue {
        return ErrPositionTooLarge
    }
    // 2. 检查杠杆 / Check leverage
    if order.Leverage > maxLeverage {
        return ErrLeverageTooHigh
    }
    // 3. 检查日亏损 / Check daily loss
    if todayLoss + potentialLoss > dailyLossLimit {
        return ErrDailyLossExceeded
    }
    // 4. 检查挂单数 / Check open orders
    if openOrderCount >= maxOpenOrders {
        return ErrTooManyOpenOrders
    }
    return nil  // 通过所有检查 / Pass all checks
}
```

---

## 6. 回测系统 / Backtesting System

### 6.1 功能说明 / Features

**中文：**

回测系统允许用户使用历史市场数据测试交易策略的表现。系统模拟策略在指定时间段内的交易行为，计算关键绩效指标。

**English:**

The backtesting system allows users to test trading strategy performance using historical market data. It simulates strategy trading behavior over a specified time period and calculates key performance metrics.

### 6.2 绩效指标 / Performance Metrics

| 指标 / Metric | 说明 / Description |
|---|---|
| 总收益率 / Total Return | (最终资金 - 初始资金) / 初始资金 × 100% |
| 胜率 / Win Rate | 盈利交易数 / 总交易数 × 100% |
| 最大回撤 / Max Drawdown | 峰值到谷值的最大跌幅百分比 |
| 夏普比率 / Sharpe Ratio | (策略收益 - 无风险收益) / 策略波动率 |

### 6.3 使用示例 / Usage Example

```bash
# 运行回测 / Run backtest
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

## 7. WebSocket 实时数据 / WebSocket Real-time Data

### 7.1 连接 / Connection

```javascript
const ws = new WebSocket('ws://localhost:8001/ws/?token=<jwt_token>');
```

### 7.2 订阅消息 / Subscribe Messages

```json
// 订阅行情 / Subscribe to ticker
{"type": "subscribe", "channel": "ticker", "symbol": "BTC"}

// 订阅订单更新 / Subscribe to order updates
{"type": "subscribe", "channel": "orders"}

// 订阅策略信号 / Subscribe to strategy signals
{"type": "subscribe", "channel": "signals"}
```

### 7.3 推送消息格式 / Push Message Format

```json
// 行情更新 / Ticker update
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

// 订单成交 / Order filled
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

## 8. 策略类型 / Strategy Types

| 类型 / Type | 说明 / Description |
|---|---|
| `grid` | 网格交易：在价格区间内自动挂单 / Grid trading: auto-place orders within price range |
| `dca` | 定投策略：定期定额买入 / Dollar-cost averaging: periodic fixed-amount purchases |
| `momentum` | 动量策略：追踪价格趋势 / Momentum: follow price trends |
| `arbitrage` | 套利策略：利用交易所价差 / Arbitrage: exploit exchange price differences |
| `custom` | 自定义策略：用户编写策略代码 / Custom: user-written strategy code |
