"""
Trend report service – computes a composite trend score from five analysis dimensions.

Dimension weights (base):
  - Macro Economy:          20 %
  - Regulation & Policy:    25 %
  - Supply & Demand:        25 %
  - Market Sentiment:       15 %
  - Technical Analysis:     15 %

Each dimension provides:
  * raw_score  in [-100, 100]  (normalised to [-1, 1])
  * severity   in [0, 1]       (importance / urgency of this dimension)

Weight adjustment:
  adjusted_weight = base_weight × (1 + boost_factor)
  boost_factor    = severity × 0.8

All adjusted weights are then normalised so they sum to 1.
The composite score is the weighted average of normalised dimension scores.

Signal classification (composite_score):
   0.5  ..  1.0  → strong_bullish   (强烈看多)
   0.2  ..  0.5  → mild_bullish     (温和看多)
  -0.2  ..  0.2  → neutral          (震荡/中性)
  -0.5  .. -0.2  → mild_bearish     (温和看空)
  -1.0  .. -0.5  → strong_bearish   (强烈看空)
"""

from __future__ import annotations

from app.models.schemas import DimensionScore, TrendSignal


# ── Base weights ──────────────────────────────────────────────────────────────

BASE_WEIGHTS: dict[str, float] = {
    "macro": 0.20,
    "policy": 0.25,
    "supply_demand": 0.25,
    "sentiment": 0.15,
    "technical": 0.15,
}

BOOST_MULTIPLIER = 0.8  # max boost = severity × this value


# ── Public API ────────────────────────────────────────────────────────────────

def compute_trend(
    dimensions: list[DimensionScore],
) -> tuple[float, TrendSignal]:
    """Return (composite_score, signal) from a list of *DimensionScore* items.

    Each *DimensionScore* is expected to already carry *raw_score* in [-1, 1]
    and *base_weight* / *severity*.
    """
    # 1. Adjust weights
    adjusted: list[float] = []
    for d in dimensions:
        boost = d.severity * BOOST_MULTIPLIER
        adjusted.append(d.base_weight * (1 + boost))

    # 2. Normalise so they sum to 1
    total = sum(adjusted)
    if total == 0:
        normalised = [1.0 / len(dimensions)] * len(dimensions)
    else:
        normalised = [w / total for w in adjusted]

    # Write back to dimension objects
    for d, nw in zip(dimensions, normalised):
        d.adjusted_weight = round(nw, 4)

    # 3. Weighted composite
    composite = sum(d.raw_score * d.adjusted_weight for d in dimensions)
    composite = max(-1.0, min(1.0, composite))
    composite = round(composite, 4)

    # 4. Classify signal
    signal = classify_signal(composite)

    return composite, signal


def classify_signal(score: float) -> TrendSignal:
    if score >= 0.5:
        return TrendSignal.strong_bullish
    if score >= 0.2:
        return TrendSignal.mild_bullish
    if score > -0.2:
        return TrendSignal.neutral
    if score > -0.5:
        return TrendSignal.mild_bearish
    return TrendSignal.strong_bearish


def normalise_score(raw: float, lo: float = -100, hi: float = 100) -> float:
    """Map *raw* from [lo, hi] → [-1, 1]."""
    clamped = max(lo, min(hi, raw))
    return round((clamped - lo) / (hi - lo) * 2 - 1, 4)


def severity_from_score(score_0_100: float) -> float:
    """Derive a severity value in [0, 1] from a 0-100 absolute score."""
    return round(min(abs(score_0_100) / 100, 1.0), 4)
