"""Module 21: Config Hot-Reload + Feature Flags

Watches ``addon_config.json`` for changes (polling every 30 s by default)
and notifies registered observers when values change.

Feature flags (all readable via ``is_feature_enabled``):
    FEATURE_POLYMARKET_ENABLED      default false
    FEATURE_CN_STOCK_ENABLED        default true
    FEATURE_HK_STOCK_ENABLED        default true
    FEATURE_EXPERIMENT_ENABLED      default true
    FEATURE_AI_FEEDBACK_ENABLED     default false
    FEATURE_NEWS_ENABLED            default true

Usage::

    from app.utils.config_hot_reload import ConfigHotReloader

    reloader = ConfigHotReloader("addon_config.json")
    reloader.subscribe(lambda cfg: print("Config changed:", cfg))
    reloader.start()

    enabled = reloader.is_feature_enabled("FEATURE_CN_STOCK_ENABLED")
"""
from __future__ import annotations

import json
import logging
import os
import threading
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

_RELOAD_INTERVAL = int(os.getenv("CONFIG_RELOAD_INTERVAL_SEC") or "30")

_DEFAULT_FLAGS: Dict[str, bool] = {
    "FEATURE_POLYMARKET_ENABLED": False,
    "FEATURE_CN_STOCK_ENABLED": True,
    "FEATURE_HK_STOCK_ENABLED": True,
    "FEATURE_EXPERIMENT_ENABLED": True,
    "FEATURE_AI_FEEDBACK_ENABLED": False,
    "FEATURE_NEWS_ENABLED": True,
}


class ConfigHotReloader:
    """Polls a JSON config file and broadcasts changes to subscribers.

    Args:
        config_path:   Path to the JSON config file.
        interval_sec:  Polling interval in seconds.
    """

    def __init__(
        self,
        config_path: str = "addon_config.json",
        interval_sec: int = _RELOAD_INTERVAL,
    ) -> None:
        self._path = Path(config_path)
        self._interval = interval_sec
        self._config: Dict[str, Any] = {}
        self._last_mtime: float = 0.0
        self._subscribers: List[Callable[[Dict], None]] = []
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        # Load once immediately
        self._reload()

    # ------------------------------------------------------------------
    # Observer registration
    # ------------------------------------------------------------------

    def subscribe(self, callback: Callable[[Dict], None]) -> None:
        """Register *callback* to be called with the new config on change."""
        with self._lock:
            self._subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[Dict], None]) -> None:
        with self._lock:
            self._subscribers = [s for s in self._subscribers if s is not callback]

    # ------------------------------------------------------------------
    # Config access
    # ------------------------------------------------------------------

    def get(self, key: str, default: Any = None) -> Any:
        """Return the current value of *key* from the loaded config."""
        with self._lock:
            return self._config.get(key, default)

    def is_feature_enabled(self, name: str) -> bool:
        """Return whether feature flag *name* is enabled.

        Resolution order:
            1. Environment variable ``name`` set to "true"/"false"
            2. Value in the loaded config file
            3. Hard-coded default from ``_DEFAULT_FLAGS``
        """
        env_val = os.getenv(name)
        if env_val is not None:
            return env_val.lower() == "true"
        with self._lock:
            if name in self._config:
                val = self._config[name]
                if isinstance(val, bool):
                    return val
                return str(val).lower() == "true"
        return _DEFAULT_FLAGS.get(name, False)

    # ------------------------------------------------------------------
    # Background thread
    # ------------------------------------------------------------------

    def start(self) -> None:
        """Start the background polling thread."""
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._poll_loop, name="ConfigHotReloader", daemon=True
        )
        self._thread.start()
        logger.info("ConfigHotReloader started (interval=%ds, path=%s)",
                    self._interval, self._path)

    def stop(self) -> None:
        """Stop the background polling thread."""
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=self._interval + 2)
        logger.info("ConfigHotReloader stopped")

    def _poll_loop(self) -> None:
        while not self._stop.is_set():
            try:
                self._check_for_changes()
            except Exception as exc:
                logger.debug("ConfigHotReloader poll error: %s", exc)
            self._stop.wait(self._interval)

    def _check_for_changes(self) -> None:
        if not self._path.exists():
            return
        mtime = self._path.stat().st_mtime
        if mtime <= self._last_mtime:
            return
        self._reload()

    def _reload(self) -> None:
        if not self._path.exists():
            return
        try:
            with self._path.open(encoding="utf-8") as fh:
                new_config = json.load(fh)
            self._last_mtime = self._path.stat().st_mtime
            with self._lock:
                old_config = self._config
                self._config = new_config
            if new_config != old_config:
                logger.info("Config reloaded from %s", self._path)
                self._notify(new_config)
        except Exception as exc:
            logger.warning("Failed to reload config from %s: %s", self._path, exc)

    def _notify(self, config: Dict) -> None:
        with self._lock:
            subscribers = list(self._subscribers)
        for cb in subscribers:
            try:
                cb(config)
            except Exception as exc:
                logger.warning("Config subscriber raised: %s", exc)
