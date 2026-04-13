-- CryptoHub V3 Supplement Migration
-- All statements use IF NOT EXISTS for idempotent execution

CREATE TABLE IF NOT EXISTS qd_pending_orders (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL,
    strategy_id      INTEGER,
    credential_id    INTEGER,
    exchange_id      VARCHAR(40)    DEFAULT '',
    symbol           VARCHAR(60)    NOT NULL,
    condition_type   VARCHAR(30)    NOT NULL,
    trigger_price    DECIMAL(24,8)  NOT NULL,
    amount           DECIMAL(24,8)  DEFAULT 0,
    side             VARCHAR(10)    DEFAULT '',
    market_type      VARCHAR(20)    DEFAULT 'swap',
    leverage         INTEGER        DEFAULT 1,
    status           VARCHAR(20)    DEFAULT 'pending',
    expires_at       TIMESTAMP,
    triggered_at     TIMESTAMP,
    filled_at        TIMESTAMP,
    error_msg        TEXT           DEFAULT '',
    created_at       TIMESTAMP      DEFAULT NOW(),
    updated_at       TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qd_ai_feedback (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER  NOT NULL,
    analysis_id  INTEGER  NOT NULL,
    feedback     VARCHAR(20) NOT NULL,
    comment      TEXT     DEFAULT '',
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qd_analysis_memory (
    id                 SERIAL PRIMARY KEY,
    user_id            INTEGER       NOT NULL,
    market             VARCHAR(30)   NOT NULL,
    symbol             VARCHAR(60)   NOT NULL,
    direction          VARCHAR(20),
    confidence         DECIMAL(5,2),
    entry_price        DECIMAL(24,8),
    stop_loss          DECIMAL(24,8),
    take_profit        DECIMAL(24,8),
    reasoning          TEXT,
    was_correct        BOOLEAN,
    actual_return_pct  DECIMAL(10,4),
    analysis_json      TEXT,
    lang               VARCHAR(10)   DEFAULT 'zh-CN',
    created_at         TIMESTAMP     DEFAULT NOW(),
    validated_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_orders_status  ON qd_pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_user    ON qd_pending_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user       ON qd_ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_memory_user   ON qd_analysis_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_memory_market ON qd_analysis_memory(market, symbol);
