"""Module 14 + 24: Backend i18n Middleware and AI Language Instruction

Supported languages:
    zh-CN, zh-TW, en-US, ja, ko, es, fr, de, pt, ar

Usage::

    from app.utils.i18n import t, get_current_language, get_ai_language_instruction

    # Inside a Flask request context:
    lang = get_current_language()
    msg  = t("errors.rate_limited")
    inst = get_ai_language_instruction(lang)
"""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Translation file loading
# ---------------------------------------------------------------------------

_I18N_DIR = Path(__file__).parent.parent / "i18n"
_translations: Dict[str, Dict] = {}


def _load_translations() -> None:
    """Load all JSON translation files from the i18n directory."""
    if not _I18N_DIR.exists():
        logger.warning("i18n directory not found: %s", _I18N_DIR)
        return
    for path in _I18N_DIR.glob("*.json"):
        lang_code = path.stem.replace("_", "-")  # zh_CN -> zh-CN
        try:
            with path.open(encoding="utf-8") as fh:
                _translations[lang_code] = json.load(fh)
            logger.debug("Loaded translations for %s", lang_code)
        except Exception as exc:
            logger.warning("Failed to load %s: %s", path, exc)


_load_translations()

# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

_LANG_ALIASES: Dict[str, str] = {
    "zh": "zh-CN",
    "zh-cn": "zh-CN",
    "zh-hans": "zh-CN",
    "zh-tw": "zh-TW",
    "zh-hant": "zh-TW",
    "en": "en-US",
    "en-us": "en-US",
    "en-gb": "en-US",
    "ja": "ja",
    "ko": "ko",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "pt": "pt",
    "ar": "ar",
}

_SUPPORTED = {"zh-CN", "zh-TW", "en-US", "ja", "ko", "es", "fr", "de", "pt", "ar"}
_DEFAULT_LANG = "zh-CN"


def _normalise_lang(raw: str) -> str:
    """Normalise a raw Accept-Language token to a supported code."""
    raw = raw.strip().lower().split(";")[0].strip()
    return _LANG_ALIASES.get(raw, raw if raw in _SUPPORTED else _DEFAULT_LANG)


def get_current_language() -> str:
    """Detect language from the current Flask request context.

    Checks (in order):
        1. ``?lang=`` query parameter
        2. ``Accept-Language`` header
        3. Default ``zh-CN``
    """
    try:
        from flask import request

        lang_param = request.args.get("lang", "").strip()
        if lang_param:
            return _normalise_lang(lang_param)

        accept = request.headers.get("Accept-Language", "")
        if accept:
            # Take the highest-priority language tag
            first = accept.split(",")[0]
            return _normalise_lang(first)
    except RuntimeError:
        # Outside request context
        pass
    return _DEFAULT_LANG


# ---------------------------------------------------------------------------
# Translation lookup
# ---------------------------------------------------------------------------

def _deep_get(d: Dict, keys: list) -> Optional[Any]:
    for key in keys:
        if not isinstance(d, dict):
            return None
        d = d.get(key)  # type: ignore
    return d


def t(key: str, lang: Optional[str] = None, **kwargs: Any) -> str:
    """Translate *key* (dot-separated) for the given or detected *lang*.

    Example::

        t("errors.rate_limited")
        t("notifications.order_triggered", symbol="BTC", side="buy", price="50000")
    """
    resolved_lang = lang or get_current_language()
    translation_dict = _translations.get(resolved_lang) or _translations.get("en-US") or {}
    parts = key.split(".")
    value = _deep_get(translation_dict, parts)
    if value is None:
        logger.debug("Missing translation key '%s' for lang '%s'", key, resolved_lang)
        return key
    if kwargs and isinstance(value, str):
        try:
            value = value.format(**kwargs)
        except KeyError:
            pass
    return str(value)


# ---------------------------------------------------------------------------
# AI language instruction (Module 24)
# ---------------------------------------------------------------------------

_AI_INSTRUCTIONS: Dict[str, str] = {
    "zh-CN": "请用中文回答。",
    "zh-TW": "請用繁體中文回答。",
    "en-US": "Please respond in English.",
    "ja":    "日本語で回答してください。",
    "ko":    "한국어로 대답하세요.",
    "es":    "Por favor responde en español.",
    "fr":    "Veuillez répondre en français.",
    "de":    "Bitte antworten Sie auf Deutsch.",
    "pt":    "Por favor responda em português.",
    "ar":    "يرجى الرد باللغة العربية.",
}


def get_ai_language_instruction(lang: Optional[str] = None) -> str:
    """Return the AI system-prompt language instruction for *lang*.

    Falls back to the translation file value when available, then to the
    built-in mapping.
    """
    resolved = lang or get_current_language()
    # Try translation file first
    translated = t("ai.language_instruction", lang=resolved)
    if translated and translated != "ai.language_instruction":
        return translated
    return _AI_INSTRUCTIONS.get(resolved, _AI_INSTRUCTIONS["en-US"])


# ---------------------------------------------------------------------------
# Flask middleware
# ---------------------------------------------------------------------------

class I18nMiddleware:
    """Flask middleware that injects ``g.lang`` into every request context."""

    def __init__(self, app=None) -> None:
        if app is not None:
            self.init_app(app)

    def init_app(self, app) -> None:
        app.before_request(self._inject_language)

    @staticmethod
    def _inject_language() -> None:
        try:
            from flask import g
            g.lang = get_current_language()
        except Exception:
            pass
