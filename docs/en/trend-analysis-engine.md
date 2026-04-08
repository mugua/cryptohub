# Trend Analysis Engine Technical Documentation

## 1. Overview

The CryptoHub Trend Analysis Engine is the core module responsible for integrating multi-dimensional market data, calculating composite trend scores through a weighted factor model, and generating quantitative trend analysis reports. The engine supports 22 pre-configured factors across five categories: macroeconomics, policy & regulation, supply & demand, market sentiment, and technical analysis. Each factor has independently configurable weights and dynamic boost coefficients, with support for per-coin (e.g., BTC, ETH) differentiated configuration.

---

## 2. Core Algorithm

### 2.1 Weighted Factor Model

```python
# Pseudocode
def calculate_trend_score(coin_symbol: str):
    factors = load_active_factors()
    overrides = load_coin_overrides(coin_symbol)

    weighted_sum = 0.0
    weight_total = 0.0

    for factor in factors:
        # Get effective weight (coin override > default)
        weight = overrides.get(factor.id, {}).get('weight', factor.default_weight)
        # Get boost coefficient (default 1.0)
        boost = overrides.get(factor.id, {}).get('boost_coefficient', 1.0)
        # Get raw factor score (-100 ~ +100)
        score = fetch_factor_score(factor)

        weighted_sum += score * weight * boost
        weight_total += weight * boost

    # Normalize to -100 ~ +100
    if weight_total > 0:
        final_score = (weighted_sum / weight_total) * 100
        final_score = clamp(final_score, -100, 100)
    else:
        final_score = 0

    signal = map_to_signal(final_score)
    return TrendReport(score=final_score, signal=signal, ...)
```

### 2.2 Signal Mapping Rules

| Score Range | Signal | Recommendation |
|---|---|---|
| [-100, -60) | `strong_sell` | Strongly recommend selling, market extremely pessimistic |
| [-60, -20) | `sell` | Recommend reducing position, market bearish |
| [-20, +20) | `neutral` | Wait and see, market uncertain |
| [+20, +60) | `buy` | Recommend building position, market bullish |
| [+60, +100] | `strong_buy` | Strongly recommend buying, market extremely optimistic |

### 2.3 Dynamic Boost Coefficient

When a factor encounters an event with significant impact on trend judgment (e.g., emergency Fed rate cut, major policy changes), its boost coefficient can be adjusted to amplify or reduce its influence on the final score.

- Default: 1.0 (no boost)
- Range: 0.1 ~ 5.0
- Use cases:
  - `boost = 2.0`: Major positive/negative events, doubling the factor's influence
  - `boost = 3.0 ~ 5.0`: Extreme events (black swan), greatly amplifying influence
  - `boost = 0.5`: Reducing a factor's influence (e.g., when data source is unstable)

---

## 3. Factor Details

### 3.1 Macro Economic Factors

| Factor | Source | Scoring Logic |
|---|---|---|
| US CPI | FRED API | CPI declining → bullish (+), CPI rising → bearish (-) |
| Fed Rate | FRED API | Rate cut → bullish (+), rate hike → bearish (-) |
| DXY | Yahoo Finance | DXY declining → bullish (+), DXY rising → bearish (-) |
| Employment | FRED API | Weak employment → possible rate cut → bullish (+) |
| M2 Supply | FRED API | M2 growth → abundant liquidity → bullish (+) |

### 3.2 Technical Analysis Factors

| Factor | Calculation | Scoring Logic |
|---|---|---|
| RSI(14) | 14-day Relative Strength Index | RSI<30: oversold (+80), RSI>70: overbought (-80), 50: neutral (0) |
| MACD | 12/26 EMA difference | MACD > signal: bullish (+), MACD < signal: bearish (-) |
| Bollinger Bands | 20-day MA ± 2σ | Price at lower band: oversold (+), upper band: overbought (-) |
| MA200 | 200-day Moving Average | Price > MA200: long-term bullish (+), Price < MA200: bearish (-) |
| Volume | Volume trend | Rising volume with price up: strong (+), with price down: weak (-) |

### 3.3 Sentiment Factors

| Factor | Source | Scoring Logic |
|---|---|---|
| Fear & Greed Index | Alternative.me | Extreme fear (0-25): possible bounce (+), extreme greed (75-100): possible pullback (-) |
| Social Media | LunarCrush | Surge in discussions: high attention, requires sentiment analysis |
| Google Trends | Google Trends API | Search volume spike: usually short-term top signal (-) |
| Funding Rate | Exchange API | High positive rate: crowded longs (-), high negative rate: crowded shorts (+) |

---

## 4. Per-coin Configuration

The system implements per-coin differentiated configuration via the `coin_factor_overrides` table. For example:

- BTC is more influenced by macroeconomics, so macro factor weights can be increased
- ETH is more influenced by technical upgrades and ecosystem development, so policy factor weights can be adjusted
- DOGE and other meme coins are more influenced by social media, so sentiment factor weights can be increased

### Configuration Example

```json
// BTC configuration overrides
{
  "us_interest_rate": { "weight": 0.15, "boost": 1.0 },  // Increase interest rate influence
  "mining_hashrate": { "weight": 0.08, "boost": 1.0 },   // BTC-specific: hashrate more important
  "social_media_volume": { "weight": 0.02, "boost": 1.0 } // Reduce social media influence
}

// ETH configuration overrides
{
  "us_interest_rate": { "weight": 0.08, "boost": 1.0 },
  "mining_hashrate": { "weight": 0.00, "boost": 1.0 },   // ETH moved to PoS, hashrate irrelevant
  "social_media_volume": { "weight": 0.06, "boost": 1.0 }
}
```

---

## 5. Data Source Integration

### Free Data Sources

| Source | Endpoint | Usage |
|---|---|---|
| CoinGecko | `api.coingecko.com/api/v3/` | Real-time prices, market cap, OHLCV |
| Alternative.me | `api.alternative.me/fng/` | Fear & Greed Index |
| Yahoo Finance | `yfinance` Python package | US Dollar Index, macro data |
| FRED | `api.stlouisfed.org` | US economic data (free API key required) |

### Data Update Frequency

| Category | Frequency |
|---|---|
| Technical | Every minute |
| Sentiment | Hourly |
| Macro | Daily |
| Policy | Event-driven |

---

## 6. API Usage Examples

### Generate Trend Report

```bash
# Generate trend report for BTC
curl -X POST http://localhost:8000/api/v1/analysis/trend/BTC/generate \
  -H "Authorization: Bearer <token>"
```

**Response:**
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

### Update Factor Weight

```bash
# Update factor weight
curl -X PUT http://localhost:8000/api/v1/settings/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.12, "is_active": true}'

# Update BTC-specific boost coefficient
curl -X PUT http://localhost:8000/api/v1/settings/coins/BTC/factors/<factor_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.15, "boost_coefficient": 2.0}'
```
