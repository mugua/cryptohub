# 趋势分析引擎技术文档 / Trend Analysis Engine Technical Documentation

## 1. 概述 / Overview

**中文：**

CryptoHub 趋势分析引擎是系统的核心模块，负责整合多维度市场数据，通过加权因子模型计算综合趋势得分，并生成量化趋势分析报告。引擎支持 22 个预设因子，涵盖宏观经济、政策法规、市场供需、市场情绪和技术分析五大类别。每个因子都可以独立配置权重和动态增强系数（Boost Coefficient），且支持按币种（如 BTC、ETH）进行差异化配置。

**English:**

The CryptoHub Trend Analysis Engine is the core module responsible for integrating multi-dimensional market data, calculating composite trend scores through a weighted factor model, and generating quantitative trend analysis reports. The engine supports 22 pre-configured factors across five categories: macroeconomics, policy & regulation, supply & demand, market sentiment, and technical analysis. Each factor has independently configurable weights and dynamic boost coefficients, with support for per-coin (e.g., BTC, ETH) differentiated configuration.

---

## 2. 核心算法 / Core Algorithm

### 2.1 加权因子模型 / Weighted Factor Model

```python
# 伪代码 / Pseudocode
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

### 2.2 信号映射规则 / Signal Mapping Rules

| 得分范围 / Score Range | 信号 / Signal | 建议 / Recommendation |
|---|---|---|
| [-100, -60) | `strong_sell` | 强烈建议卖出，市场极度悲观 / Strongly recommend selling |
| [-60, -20) | `sell` | 建议减仓，市场偏空 / Recommend reducing position |
| [-20, +20) | `neutral` | 观望为主，市场不明朗 / Wait and see |
| [+20, +60) | `buy` | 建议建仓，市场偏多 / Recommend building position |
| [+60, +100] | `strong_buy` | 强烈建议买入，市场极度乐观 / Strongly recommend buying |

### 2.3 动态增强系数 / Dynamic Boost Coefficient

**中文：**

当某个因子遇到对趋势判断有重大影响的事件时（如美联储紧急降息、重大政策变更），可以通过调整该因子的增强系数（Boost Coefficient）来放大或缩小其在最终得分中的影响力。

- 默认值：1.0（不增强）
- 增强范围：0.1 ~ 5.0
- 使用场景：
  - `boost = 2.0`：重大利好/利空事件，将该因子影响力翻倍
  - `boost = 3.0 ~ 5.0`：极端事件（如黑天鹅），极大放大影响
  - `boost = 0.5`：降低某因子影响力（如数据源不稳定时）

**English:**

When a factor encounters an event with significant impact on trend judgment (e.g., emergency Fed rate cut, major policy changes), its boost coefficient can be adjusted to amplify or reduce its influence on the final score.

- Default: 1.0 (no boost)
- Range: 0.1 ~ 5.0
- Use cases:
  - `boost = 2.0`: Major positive/negative events, doubling the factor's influence
  - `boost = 3.0 ~ 5.0`: Extreme events (black swan), greatly amplifying influence
  - `boost = 0.5`: Reducing a factor's influence (e.g., when data source is unstable)

---

## 3. 因子详细说明 / Factor Details

### 3.1 宏观经济因子 / Macro Economic Factors

| 因子 / Factor | 数据源 / Source | 评分逻辑 / Scoring Logic |
|---|---|---|
| 美国CPI / US CPI | FRED API | CPI下降→利好(+)，CPI上升→利空(-) |
| 美联储利率 / Fed Rate | FRED API | 降息→利好(+)，加息→利空(-) |
| 美元指数 / DXY | Yahoo Finance | DXY下降→利好(+)，DXY上升→利空(-) |
| 就业数据 / Employment | FRED API | 就业疲软→可能降息→利好(+) |
| M2货币供应 / M2 Supply | FRED API | M2增长→流动性充裕→利好(+) |

### 3.2 技术分析因子 / Technical Analysis Factors

| 因子 / Factor | 计算方法 / Calculation | 评分逻辑 / Scoring Logic |
|---|---|---|
| RSI(14) | 14日相对强弱指标 | RSI<30: 超卖(+80), RSI>70: 超买(-80), 50: 中性(0) |
| MACD | 12/26 EMA差值 | MACD线>信号线: 看涨(+), MACD线<信号线: 看跌(-) |
| 布林带 / Bollinger | 20日均线±2σ | 价格触下轨: 超卖(+), 触上轨: 超买(-) |
| MA200 | 200日移动平均 | 价格>MA200: 长期看涨(+), 价格<MA200: 长期看跌(-) |
| 成交量 / Volume | 成交量趋势 | 放量上涨: 强势(+), 放量下跌: 弱势(-) |

### 3.3 情绪因子 / Sentiment Factors

| 因子 / Factor | 数据源 / Source | 评分逻辑 / Scoring Logic |
|---|---|---|
| 恐惧贪婪指数 / Fear & Greed | Alternative.me | 极度恐惧(0-25): 可能反弹(+), 极度贪婪(75-100): 可能回调(-) |
| 社交媒体 / Social Media | LunarCrush | 讨论量突增: 关注度高, 需结合情感分析 |
| Google趋势 / Google Trends | Google Trends API | 搜索量激增: 通常是短期顶部信号(-) |
| 资金费率 / Funding Rate | Exchange API | 高正费率: 多头拥挤(-), 高负费率: 空头拥挤(+) |

---

## 4. 币种独立配置 / Per-coin Configuration

**中文：**

系统通过 `coin_factor_overrides` 表实现按币种的差异化配置。例如：

- BTC 更受宏观经济影响，可以增加宏观因子权重
- ETH 更受技术升级和生态发展影响，可以增加相关政策因子权重
- DOGE 等 Meme 币更受社交媒体影响，可以增加情绪因子权重

**English:**

The system implements per-coin differentiated configuration via the `coin_factor_overrides` table. For example:

- BTC is more influenced by macroeconomics, so macro factor weights can be increased
- ETH is more influenced by technical upgrades and ecosystem development, so policy factor weights can be adjusted
- DOGE and other meme coins are more influenced by social media, so sentiment factor weights can be increased

### 配置示例 / Configuration Example

```json
// BTC 配置覆盖 / BTC configuration overrides
{
  "us_interest_rate": { "weight": 0.15, "boost": 1.0 },  // 增加利率影响
  "mining_hashrate": { "weight": 0.08, "boost": 1.0 },   // BTC特有：算力更重要
  "social_media_volume": { "weight": 0.02, "boost": 1.0 } // 降低社交媒体影响
}

// ETH 配置覆盖 / ETH configuration overrides
{
  "us_interest_rate": { "weight": 0.08, "boost": 1.0 },
  "mining_hashrate": { "weight": 0.00, "boost": 1.0 },   // ETH已转PoS，算力无关
  "social_media_volume": { "weight": 0.06, "boost": 1.0 }
}
```

---

## 5. 数据源集成 / Data Source Integration

### 免费数据源 / Free Data Sources

| 数据源 / Source | API 地址 / Endpoint | 用途 / Usage |
|---|---|---|
| CoinGecko | `api.coingecko.com/api/v3/` | 实时价格、市值、OHLCV |
| Alternative.me | `api.alternative.me/fng/` | 恐惧贪婪指数 |
| Yahoo Finance | `yfinance` Python包 | 美元指数、宏观数据 |
| FRED | `api.stlouisfed.org` | 美国经济数据 (需免费API Key) |

### 数据更新频率 / Data Update Frequency

| 类别 / Category | 更新频率 / Frequency |
|---|---|
| 技术分析 / Technical | 每分钟 / Every minute |
| 市场情绪 / Sentiment | 每小时 / Hourly |
| 宏观经济 / Macro | 每日 / Daily |
| 政策法规 / Policy | 事件驱动 / Event-driven |

---

## 6. API 使用示例 / API Usage Examples

### 生成趋势报告 / Generate Trend Report

```bash
# 为BTC生成趋势报告 / Generate trend report for BTC
curl -X POST http://localhost:8000/api/v1/analysis/trend/BTC/generate \
  -H "Authorization: Bearer <token>"
```

**响应 / Response:**
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

### 更新因子权重 / Update Factor Weight

```bash
# 更新某因子权重 / Update factor weight
curl -X PUT http://localhost:8000/api/v1/settings/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.12, "is_active": true}'

# 更新BTC特定因子增强系数 / Update BTC-specific boost coefficient
curl -X PUT http://localhost:8000/api/v1/settings/coins/BTC/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.15, "boost_coefficient": 2.0}'
```
