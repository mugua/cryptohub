# 交易系统技术文档

## 1. 概述

CryptoHub 交易系统由 Go/Gin 构建的高性能交易服务提供支持。系统支持多种交易方式：手动交易、策略交易（量化交易）和虚拟盘交易（模拟盘）。通过统一的交易所接口抽象层，可以无缝对接 Binance、OKX 等主流交易所。内置风险管理模块确保交易安全，回测系统允许用户在真实下单前验证策略有效性。

---

## 2. 交易流程

```
用户下单
     ↓
┌─────────────────┐
│   风险检查       │  检查仓位、杠杆、日亏损限制
└────────┬────────┘
         ↓
┌─────────────────┐     ┌──────────────┐
│ 虚拟盘？        │─是──│  虚拟执行     │  模拟成交，不连接交易所
└────────┬────────┘      └──────────────┘
         │否
         ↓
┌─────────────────┐
│  路由到交易所    │  根据用户API设置选择交易所
└────────┬────────┘
         ↓
┌─────────────────┐
│  签名 & 下单     │  HMAC-SHA256签名，发送REST请求
└────────┬────────┘
         ↓
┌─────────────────┐
│  记录 & 通知     │  保存订单到DB，发送Kafka事件，WebSocket推送
└─────────────────┘
```

---

## 3. 支持的订单类型

| 类型 | 说明 | 使用场景 |
|---|---|---|
| `market` | 市价单，以当前市场价格立即成交 | 快速进出场 |
| `limit` | 限价单，指定价格挂单等待成交 | 精确价格交易 |
| `stop_loss` | 止损单，价格触及阈值自动卖出 | 风险控制 |
| `take_profit` | 止盈单，价格达到目标自动卖出 | 锁定利润 |

---

## 4. 交易所集成

### 4.1 Binance 接入

**认证方式：**
- HMAC-SHA256 签名
- 参数按字母排序拼接，附加 `timestamp` 和 `signature`

**主要 API：**
```
POST /api/v3/order          # 下单
DELETE /api/v3/order        # 撤单
GET  /api/v3/order          # 查询订单
GET  /api/v3/account        # 账户信息
GET  /api/v3/ticker/price   # 当前价格
```

### 4.2 OKX 接入

**认证方式：**
- HMAC-SHA256 签名
- 自定义请求头：`OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`, `OK-ACCESS-PASSPHRASE`

**主要 API：**
```
POST /api/v5/trade/order        # 下单
POST /api/v5/trade/cancel-order # 撤单
GET  /api/v5/trade/order        # 查询订单
GET  /api/v5/account/balance    # 账户余额
GET  /api/v5/market/ticker      # 行情数据
```

---

## 5. 风险管理

### 5.1 风控规则

| 检查项 | 默认限制 | 说明 |
|---|---|---|
| 最大仓位比例 | 总资产的 10% | 单币种最大持仓占总资产比例 |
| 最大杠杆 | 20x | 最大允许杠杆倍数 |
| 日亏损限制 | 总资产的 5% | 单日最大亏损占总资产比例 |
| 最大挂单数 | 50 | 同时活跃的最大订单数 |

### 5.2 风控流程

```go
func (r *RiskService) CheckOrder(order OrderRequest) error {
    // 1. 检查仓位大小
    if order.Quantity * order.Price > maxPositionValue {
        return ErrPositionTooLarge
    }
    // 2. 检查杠杆
    if order.Leverage > maxLeverage {
        return ErrLeverageTooHigh
    }
    // 3. 检查日亏损
    if todayLoss + potentialLoss > dailyLossLimit {
        return ErrDailyLossExceeded
    }
    // 4. 检查挂单数
    if openOrderCount >= maxOpenOrders {
        return ErrTooManyOpenOrders
    }
    return nil  // 通过所有检查
}
```

---

## 6. 回测系统

### 6.1 功能说明

回测系统允许用户使用历史市场数据测试交易策略的表现。系统模拟策略在指定时间段内的交易行为，计算关键绩效指标。

### 6.2 绩效指标

| 指标 | 说明 |
|---|---|
| 总收益率 | (最终资金 - 初始资金) / 初始资金 × 100% |
| 胜率 | 盈利交易数 / 总交易数 × 100% |
| 最大回撤 | 峰值到谷值的最大跌幅百分比 |
| 夏普比率 | (策略收益 - 无风险收益) / 策略波动率 |

### 6.3 使用示例

```bash
# 运行回测
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

## 7. WebSocket 实时数据

### 7.1 连接

```javascript
const ws = new WebSocket('ws://localhost:8001/ws/?token=<jwt_token>');
```

### 7.2 订阅消息

```json
// 订阅行情
{"type": "subscribe", "channel": "ticker", "symbol": "BTC"}

// 订阅订单更新
{"type": "subscribe", "channel": "orders"}

// 订阅策略信号
{"type": "subscribe", "channel": "signals"}
```

### 7.3 推送消息格式

```json
// 行情更新
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

// 订单成交
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

## 8. 策略类型

| 类型 | 说明 |
|---|---|
| `grid` | 网格交易：在价格区间内自动挂单 |
| `dca` | 定投策略：定期定额买入 |
| `momentum` | 动量策略：追踪价格趋势 |
| `arbitrage` | 套利策略：利用交易所价差 |
| `custom` | 自定义策略：用户编写策略代码 |
