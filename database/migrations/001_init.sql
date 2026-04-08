-- CryptoHub Database Schema · PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════ Users & Auth ═══════════════
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    language      VARCHAR(10)  DEFAULT 'zh-CN',
    theme         VARCHAR(20)  DEFAULT 'auto',
    timezone      VARCHAR(50)  DEFAULT 'Asia/Shanghai',
    is_active     BOOLEAN DEFAULT TRUE,
    is_admin      BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    device_info JSONB,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════ Exchange API Keys (encrypted) ═══════════════
CREATE TABLE exchange_api_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    exchange        VARCHAR(50) NOT NULL,
    label           VARCHAR(100),
    api_key_enc     BYTEA NOT NULL,
    api_secret_enc  BYTEA NOT NULL,
    passphrase_enc  BYTEA,
    permissions     JSONB DEFAULT '["read"]',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, exchange, label)
);

-- ═══════════════ Trend Analysis ═══════════════
CREATE TABLE analysis_factors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category        VARCHAR(50)  NOT NULL,
    factor_key      VARCHAR(100) UNIQUE NOT NULL,
    name_zh         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200) NOT NULL,
    description_zh  TEXT,
    description_en  TEXT,
    data_source     VARCHAR(200),
    default_weight  DECIMAL(5,4) DEFAULT 0.1,
    is_global       BOOLEAN DEFAULT TRUE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coin_factor_overrides (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coin_symbol       VARCHAR(20) NOT NULL,
    factor_id         UUID REFERENCES analysis_factors(id) ON DELETE CASCADE,
    weight            DECIMAL(5,4),
    boost_coefficient DECIMAL(5,4) DEFAULT 1.0,
    is_active         BOOLEAN DEFAULT TRUE,
    updated_by        UUID REFERENCES users(id),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coin_symbol, factor_id)
);

CREATE TABLE trend_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coin_symbol     VARCHAR(20) NOT NULL,
    report_type     VARCHAR(50) DEFAULT 'comprehensive',
    overall_score   DECIMAL(5,2),
    trend_signal    VARCHAR(20),
    factor_scores   JSONB NOT NULL,
    summary_zh      TEXT,
    summary_en      TEXT,
    valid_from      TIMESTAMPTZ DEFAULT NOW(),
    valid_until     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trend_reports_coin ON trend_reports(coin_symbol, created_at DESC);

-- ═══════════════ Trading ═══════════════
CREATE TABLE strategies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    strategy_type   VARCHAR(50) NOT NULL,
    config          JSONB NOT NULL,
    code            TEXT,
    is_active       BOOLEAN DEFAULT FALSE,
    is_paper        BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE strategy_backtest (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id     UUID REFERENCES strategies(id) ON DELETE CASCADE,
    coin_symbol     VARCHAR(20) NOT NULL,
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    initial_capital DECIMAL(20,8),
    final_capital   DECIMAL(20,8),
    total_trades    INTEGER,
    win_rate        DECIMAL(5,2),
    max_drawdown    DECIMAL(5,2),
    sharpe_ratio    DECIMAL(8,4),
    result_data     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
    strategy_id       UUID REFERENCES strategies(id) ON DELETE SET NULL,
    exchange          VARCHAR(50) NOT NULL,
    coin_symbol       VARCHAR(20) NOT NULL,
    order_type        VARCHAR(20) NOT NULL,
    side              VARCHAR(10) NOT NULL,
    quantity          DECIMAL(20,8) NOT NULL,
    price             DECIMAL(20,8),
    filled_quantity   DECIMAL(20,8) DEFAULT 0,
    filled_price      DECIMAL(20,8),
    status            VARCHAR(20) DEFAULT 'pending',
    is_paper          BOOLEAN DEFAULT FALSE,
    exchange_order_id VARCHAR(200),
    leverage          DECIMAL(5,2) DEFAULT 1,
    error_message     TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user   ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE portfolios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    allocations JSONB NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════ User Preferences ═══════════════
CREATE TABLE trading_preferences (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
    coin_symbol      VARCHAR(20) NOT NULL,
    default_leverage DECIMAL(5,2) DEFAULT 1,
    max_position_pct DECIMAL(5,2) DEFAULT 10,
    stop_loss_pct    DECIMAL(5,2) DEFAULT 5,
    take_profit_pct  DECIMAL(5,2) DEFAULT 10,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, coin_symbol)
);

CREATE TABLE notification_preferences (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    channel    VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, channel, event_type)
);

-- ═══════════════ Subscriptions ═══════════════
CREATE TABLE subscription_plans (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           VARCHAR(100) NOT NULL,
    name_zh        VARCHAR(100) NOT NULL,
    price_monthly  DECIMAL(10,2),
    price_yearly   DECIMAL(10,2),
    features       JSONB NOT NULL,
    max_strategies INTEGER DEFAULT 3,
    max_api_keys   INTEGER DEFAULT 2,
    is_active      BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_subscriptions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id              UUID REFERENCES subscription_plans(id),
    status               VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════ Fund Flow ═══════════════
CREATE TABLE fund_flows (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    flow_type     VARCHAR(20) NOT NULL,
    coin_symbol   VARCHAR(20),
    amount        DECIMAL(20,8) NOT NULL,
    balance_after DECIMAL(20,8),
    reference_id  UUID,
    description   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fund_flows_user ON fund_flows(user_id, created_at DESC);

-- ═══════════════ Seed Data ═══════════════
INSERT INTO analysis_factors (category, factor_key, name_zh, name_en, data_source, default_weight) VALUES
('macro','us_cpi','美国CPI指数','US CPI Index','FRED API',0.08),
('macro','us_interest_rate','美联储利率','Fed Interest Rate','FRED API',0.10),
('macro','dxy_index','美元指数','US Dollar Index (DXY)','Yahoo Finance',0.08),
('macro','us_employment','美国就业数据','US Employment Data','FRED API',0.05),
('macro','global_m2','全球M2货币供应','Global M2 Money Supply','FRED API',0.06),
('policy','us_crypto_policy','美国加密政策','US Crypto Policy','News Scraper',0.08),
('policy','china_crypto_policy','中国加密政策','China Crypto Policy','News Scraper',0.06),
('policy','eu_crypto_policy','欧盟加密政策','EU Crypto Policy','News Scraper',0.04),
('policy','sec_actions','SEC执法行动','SEC Enforcement','SEC RSS',0.05),
('supply_demand','exchange_reserves','交易所储备量','Exchange Reserves','CryptoQuant API',0.07),
('supply_demand','whale_movement','巨鲸动向','Whale Movements','Whale Alert API',0.06),
('supply_demand','mining_hashrate','挖矿算力','Mining Hash Rate','Blockchain.com API',0.04),
('supply_demand','etf_flows','ETF资金流向','ETF Fund Flows','News Scraper',0.06),
('sentiment','fear_greed_index','恐惧贪婪指数','Fear & Greed Index','Alternative.me API',0.08),
('sentiment','social_media_volume','社交媒体热度','Social Media Volume','LunarCrush API',0.05),
('sentiment','google_trends','谷歌搜索趋势','Google Trends','Google Trends API',0.04),
('sentiment','funding_rate','资金费率','Funding Rate','Exchange API',0.06),
('technical','rsi_14','RSI(14)','RSI(14)','Calculated',0.06),
('technical','macd','MACD','MACD','Calculated',0.06),
('technical','ma_200','MA200趋势','MA200 Trend','Calculated',0.05),
('technical','volume_profile','成交量分析','Volume Profile','Exchange API',0.05),
('technical','bollinger_bands','布林带分析','Bollinger Bands','Calculated',0.04);

INSERT INTO subscription_plans (name, name_zh, price_monthly, price_yearly, features, max_strategies, max_api_keys) VALUES
('Free','免费版',0,0,'{"trend_reports":true,"basic_trading":true}',1,1),
('Pro','专业版',29.99,299.99,'{"trend_reports":true,"advanced_trading":true,"backtesting":true,"alerts":true}',10,5),
('Enterprise','企业版',99.99,999.99,'{"trend_reports":true,"advanced_trading":true,"backtesting":true,"alerts":true,"api_access":true,"priority_support":true}',-1,-1);
