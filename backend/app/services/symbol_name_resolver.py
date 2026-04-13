"""Module 10: Symbol Name Resolver

Resolves human-readable names for stock/crypto symbols.

Built-in mappings cover:
  A-share 50+, HK 30+, US stock 50+, Crypto 30+

Falls back to AKShare / yfinance / CoinGecko for unknown symbols.
Results are cached for 24 h.

Usage::

    from app.services.symbol_name_resolver import SymbolNameResolver

    r = SymbolNameResolver()
    name = r.resolve("cn_stock", "600519")      # "贵州茅台"
    names = r.batch_resolve("us_stock", ["AAPL", "MSFT"])
"""
from __future__ import annotations

import logging
import time
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

_CACHE_TTL = 86400  # 24 h

# ---------------------------------------------------------------------------
# Built-in mappings
# ---------------------------------------------------------------------------

_CN_STOCK: Dict[str, str] = {
    "600519": "贵州茅台", "601398": "工商银行", "601288": "农业银行",
    "601988": "中国银行", "601939": "建设银行", "601328": "交通银行",
    "600036": "招商银行", "601318": "中国平安", "600030": "中信证券",
    "600276": "恒瑞医药", "601166": "兴业银行", "601601": "中国太保",
    "600887": "伊利股份", "601088": "中国神华", "600028": "中国石化",
    "601857": "中国石油", "601628": "中国人寿", "600104": "上汽集团",
    "601766": "中国中车", "601390": "中国中铁", "601186": "中国铁建",
    "600048": "保利发展", "000858": "五粮液",   "000333": "美的集团",
    "000002": "万科A",    "000001": "平安银行", "002415": "海康威视",
    "000651": "格力电器", "002230": "科大讯飞", "300750": "宁德时代",
    "600009": "上海机场", "601111": "中国国航", "600016": "民生银行",
    "601600": "中国铝业", "600547": "山东黄金", "601899": "紫金矿业",
    "600690": "海尔智家", "000725": "京东方A",  "002594": "比亚迪",
    "601012": "隆基绿能", "300059": "东方财富", "601127": "赛力斯",
    "600900": "长江电力", "601985": "中国核电", "600941": "中国移动",
    "601728": "中国电信", "600050": "中国联通", "688981": "中芯国际",
}

_HK_STOCK: Dict[str, str] = {
    "00700": "腾讯控股", "09988": "阿里巴巴", "03690": "美团",
    "09618": "京东集团", "01810": "小米集团", "00005": "汇丰控股",
    "00941": "中国移动", "00883": "中国海洋石油", "02318": "中国平安",
    "01299": "友邦保险", "02628": "中国人寿", "01398": "工商银行",
    "03988": "中国银行", "00939": "建设银行", "01288": "农业银行",
    "02388": "中银香港", "00002": "中电控股", "00003": "香港中华煤气",
    "00006": "电能实业", "00011": "恒生银行", "00012": "恒基地产",
    "00016": "新鸿基地产", "00017": "新世界发展", "00001": "长和",
    "01177": "中国生物制药", "02269": "药明生物", "06160": "百济神州",
    "09999": "网易",    "01024": "快手",       "00020": "商汤科技",
}

_US_STOCK: Dict[str, str] = {
    "AAPL": "Apple", "MSFT": "Microsoft", "AMZN": "Amazon",
    "GOOGL": "Alphabet", "GOOG": "Alphabet C", "META": "Meta",
    "NVDA": "NVIDIA", "TSLA": "Tesla", "BRK.B": "Berkshire B",
    "JPM": "JPMorgan", "V": "Visa", "MA": "Mastercard",
    "UNH": "UnitedHealth", "JNJ": "Johnson & Johnson", "XOM": "ExxonMobil",
    "LLY": "Eli Lilly", "PG": "Procter & Gamble", "HD": "Home Depot",
    "CVX": "Chevron", "MRK": "Merck", "ABBV": "AbbVie",
    "KO": "Coca-Cola", "PEP": "PepsiCo", "AVGO": "Broadcom",
    "COST": "Costco", "AMD": "AMD", "INTC": "Intel",
    "CRM": "Salesforce", "ADBE": "Adobe", "NFLX": "Netflix",
    "DIS": "Disney", "PYPL": "PayPal", "UBER": "Uber",
    "BABA": "Alibaba ADR", "JD": "JD.com ADR", "PDD": "PDD",
    "NIO": "NIO", "XPEV": "XPeng", "LI": "Li Auto",
    "BIDU": "Baidu ADR", "TCEHY": "Tencent ADR", "TSM": "TSMC ADR",
    "ASML": "ASML", "SAP": "SAP", "TM": "Toyota",
    "SONY": "Sony", "NVO": "Novo Nordisk", "HSBC": "HSBC ADR",
    "SPY": "S&P500 ETF", "QQQ": "NASDAQ ETF", "IWM": "Russell2000 ETF",
}

_CRYPTO: Dict[str, str] = {
    "BTC": "Bitcoin", "ETH": "Ethereum", "BNB": "BNB",
    "XRP": "XRP", "ADA": "Cardano", "DOGE": "Dogecoin",
    "SOL": "Solana", "DOT": "Polkadot", "AVAX": "Avalanche",
    "SHIB": "Shiba Inu", "MATIC": "Polygon", "LTC": "Litecoin",
    "LINK": "Chainlink", "UNI": "Uniswap", "ATOM": "Cosmos",
    "ETC": "Ethereum Classic", "XLM": "Stellar", "ALGO": "Algorand",
    "VET": "VeChain", "NEAR": "NEAR Protocol", "FTM": "Fantom",
    "SAND": "The Sandbox", "MANA": "Decentraland", "AXS": "Axie Infinity",
    "APE": "ApeCoin", "OP": "Optimism", "ARB": "Arbitrum",
    "SUI": "Sui", "SEI": "Sei", "TIA": "Celestia",
    "INJ": "Injective", "PEPE": "Pepe",
}

_MARKET_MAP = {
    "cn_stock": _CN_STOCK,
    "hk_stock": _HK_STOCK,
    "us_stock": _US_STOCK,
    "crypto": _CRYPTO,
}

# In-memory cache: {market:symbol -> (name, expires_at)}
_cache: Dict[str, tuple] = {}


class SymbolNameResolver:
    """Resolves display names for financial symbols."""

    def resolve(self, market: str, symbol: str) -> str:
        """Return the display name for *symbol* in *market*.

        Returns *symbol* itself when resolution fails.
        """
        key = f"{market}:{symbol.upper()}"
        entry = _cache.get(key)
        if entry:
            name, expires_at = entry
            if time.time() < expires_at:
                return name

        # Built-in lookup
        mapping = _MARKET_MAP.get(market, {})
        sym_upper = symbol.upper()
        # normalise HK: strip leading zeros inconsistency
        if market == "hk_stock":
            sym_upper = symbol.lstrip("0").zfill(5).upper()
            name = mapping.get(sym_upper) or mapping.get(symbol.zfill(5))
        else:
            name = mapping.get(sym_upper)

        if name:
            _cache[key] = (name, time.time() + _CACHE_TTL)
            return name

        # Remote fallbacks
        name = self._remote_resolve(market, symbol)
        if name:
            _cache[key] = (name, time.time() + _CACHE_TTL)
            return name

        return symbol

    def batch_resolve(self, market: str, symbols: List[str]) -> Dict[str, str]:
        """Resolve multiple symbols at once."""
        return {sym: self.resolve(market, sym) for sym in symbols}

    # ------------------------------------------------------------------
    # Remote resolution
    # ------------------------------------------------------------------

    def _remote_resolve(self, market: str, symbol: str) -> Optional[str]:
        if market == "crypto":
            return self._coingecko(symbol)
        return self._yfinance_name(symbol)

    @staticmethod
    def _coingecko(symbol: str) -> Optional[str]:
        try:
            import requests

            resp = requests.get(
                "https://api.coingecko.com/api/v3/search",
                params={"query": symbol},
                timeout=8,
            )
            resp.raise_for_status()
            coins = resp.json().get("coins", [])
            if coins:
                return coins[0].get("name")
        except Exception as exc:
            logger.debug("CoinGecko resolve(%s): %s", symbol, exc)
        return None

    @staticmethod
    def _yfinance_name(symbol: str) -> Optional[str]:
        try:
            import yfinance as yf  # type: ignore

            info = yf.Ticker(symbol).info
            return info.get("longName") or info.get("shortName")
        except Exception as exc:
            logger.debug("yfinance name(%s): %s", symbol, exc)
        return None
