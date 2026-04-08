# 趋势分析引擎技术文档

## 1. 概述

CryptoHub 趋势分析引擎是系统的核心模块，负责整合多维度市场数据，通过加权因子模型计算综合趋势得分，并生成量化趋势分析报告。引擎支持 22 个预设因子，涵盖宏观经济、政策法规、市场供需、市场情绪和技术分析五大类别。每个因子都可以独立配置权重和动态增强系数（Boost Coefficient），且支持按币种（如 BTC、ETH）进行差异化配置。

---

## 2. 核心算法

### 2.1 加权因子模型

```python
# 伪代码
def calculate_trend_score(coin_symbol: str):
    factors = load_active_factors()           # 加载活跃因子
    overrides = load_coin_overrides(coin_symbol)  # 加载币种覆盖配置

    weighted_sum = 0.0
    weight_total = 0.0

    for factor in factors:
        # 获取有效权重（币种覆盖 > 默认）
        weight = overrides.get(factor.id, {}).get('weight', factor.default_weight)
        # 获取增强系数（默认 1.0）
        boost = overrides.get(factor.id, {}).get('boost_coefficient', 1.0)
        # 获取因子原始得分 (-100 ~ +100)
        score = fetch_factor_score(factor)

        weighted_sum += score * weight * boost
        weight_total += weight * boost

    # 归一化到 -100 ~ +100
    if weight_total > 0:
        final_score = (weighted_sum / weight_total) * 100
        final_score = clamp(final_score, -100, 100)
    else:
        final_score = 0

    signal = map_to_signal(final_score)
    return TrendReport(score=final_score, signal=signal, ...)
```

### 2.2 信号映射规则

| 得分范围 | 信号 | 建议 |
|---|---|---|
| [-100, -60) | `strong_sell` | 强烈建议卖出，市场极度悲观 |
| [-60, -20) | `sell` | 建议减仓，市场偏空 |
| [-20, +20) | `neutral` | 观望为主，市场不明朗 |
| [+20, +60) | `buy` | 建议建仓，市场偏多 |
| [+60, +100] | `strong_buy` | 强烈建议买入，市场极度乐观 |

### 2.3 动态增强系数

当某个因子遇到对趋势判断有重大影响的事件时（如美联储紧急降息、重大政策变更），可以通过调整该因子的增强系数（Boost Coefficient）来放大或缩小其在最终得分中的影响力。

- 默认值：1.0（不增强）
- 增强范围：0.1 ~ 5.0
- 使用场景：
  - `boost = 2.0`：重大利好/利空事件，将该因子影响力翻倍
  - `boost = 3.0 ~ 5.0`：极端事件（如黑天鹅），极大放大影响
  - `boost = 0.5`：降低某因子影响力（如数据源不稳定时）

---

## 3. 因子详细说明

### 3.1 宏观经济因子

| 因子 | 数据源 | 评分逻辑 |
|---|---|---|
| 美国CPI | FRED API | CPI下降→利好(+)，CPI上升→利空(-) |
| 美联储利率 | FRED API | 降息→利好(+)，加息→利空(-) |
| 美元指数 | Yahoo Finance | DXY下降→利好(+)，DXY上升→利空(-) |
| 就业数据 | FRED API | 就业疲软→可能降息→利好(+) |
| M2货币供应 | FRED API | M2增长→流动性充裕→利好(+) |

### 3.2 技术分析因子

| 因子 | 计算方法 | 评分逻辑 |
|---|---|---|
| RSI(14) | 14日相对强弱指标 | RSI<30: 超卖(+80), RSI>70: 超买(-80), 50: 中性(0) |
| MACD | 12/26 EMA差值 | MACD线>信号线: 看涨(+), MACD线<信号线: 看跌(-) |
| 布林带 | 20日均线±2σ | 价格触下轨: 超卖(+), 触上轨: 超买(-) |
| MA200 | 200日移动平均 | 价格>MA200: 长期看涨(+), 价格<MA200: 长期看跌(-) |
| 成交量 | 成交量趋势 | 放量上涨: 强势(+), 放量下跌: 弱势(-) |

### 3.3 情绪因子

| 因子 | 数据源 | 评分逻辑 |
|---|---|---|
| 恐惧贪婪指数 | Alternative.me | 极度恐惧(0-25): 可能反弹(+), 极度贪婪(75-100): 可能回调(-) |
| 社交媒体 | LunarCrush | 讨论量突增: 关注度高, 需结合情感分析 |
| Google趋势 | Google Trends API | 搜索量激增: 通常是短期顶部信号(-) |
| 资金费率 | Exchange API | 高正费率: 多头拥挤(-), 高负费率: 空头拥挤(+) |

---

## 4. 币种独立配置

系统通过 `coin_factor_overrides` 表实现按币种的差异化配置。例如：

- BTC 更受宏观经济影响，可以增加宏观因子权重
- ETH 更受技术升级和生态发展影响，可以增加相关政策因子权重
- DOGE 等 Meme 币更受社交媒体影响，可以增加情绪因子权重

### 配置示例

```json
// BTC 配置覆盖
{
  "us_interest_rate": { "weight": 0.15, "boost": 1.0 },  // 增加利率影响
  "mining_hashrate": { "weight": 0.08, "boost": 1.0 },   // BTC特有：算力更重要
  "social_media_volume": { "weight": 0.02, "boost": 1.0 } // 降低社交媒体影响
}

// ETH 配置覆盖
{
  "us_interest_rate": { "weight": 0.08, "boost": 1.0 },
  "mining_hashrate": { "weight": 0.00, "boost": 1.0 },   // ETH已转PoS，算力无关
  "social_media_volume": { "weight": 0.06, "boost": 1.0 }
}
```

---

## 5. 数据源集成

### 免费数据源

| 数据源 | API 地址 | 用途 |
|---|---|---|
| CoinGecko | `api.coingecko.com/api/v3/` | 实时价格、市值、OHLCV |
| Alternative.me | `api.alternative.me/fng/` | 恐惧贪婪指数 |
| Yahoo Finance | `yfinance` Python包 | 美元指数、宏观数据 |
| FRED | `api.stlouisfed.org` | 美国经济数据 (需免费API Key) |

### 数据更新频率

| 类别 | 更新频率 |
|---|---|
| 技术分析 | 每分钟 |
| 市场情绪 | 每小时 |
| 宏观经济 | 每日 |
| 政策法规 | 事件驱动 |

---

## 6. API 使用示例

### 生成趋势报告

```bash
# 为BTC生成趋势报告
curl -X POST http://localhost:8000/api/v1/analysis/trend/BTC/generate \
  -H "Authorization: Bearer <token>"
```

**响应：**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "coin_symbol": "BTC",
  "overall_score": 42.5,
  "trend_signal": "buy",
  "factor_scores": {
    "macro": { "us_cpi": 30, "us_interest_rate": 50, "dxy_index": 40 },
    "sentiment": { "fear_greed_index": 65, "funding_rate": 20 },
    "technical": { "rsi_14": 55, "macd": 40, "ma_200": 60 }
  },
  "summary_zh": "BTC当前趋势偏多，综合得分42.5。宏观面利好，美联储暂停加息...",
  "summary_en": "BTC current trend is bullish with a score of 42.5. Macro outlook positive...",
  "created_at": "2026-04-08T09:00:00Z"
}
```

### 更新因子权重

```bash
# 更新某因子权重
curl -X PUT http://localhost:8000/api/v1/settings/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.12, "is_active": true}'

# 更新BTC特定因子增强系数
curl -X PUT http://localhost:8000/api/v1/settings/coins/BTC/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.15, "boost_coefficient": 2.0}'
```
