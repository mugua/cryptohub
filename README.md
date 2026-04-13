量化交易平台技术方案 — 结合 QuantDinger 增补版
一、QuantDinger 现有功能与我们方案的对照表
通过分析 QuantDinger 的 routes（20+ 路由文件）和 services（30+ 服务文件），梳理出完整功能清单。

Code
┌─────────────────────────────────────────────────────────────────────────────┐
│        功能模块                  │ QuantDinger 已有  │ 我们方案已覆盖 │ 需增补  │
├─────────────────────────────────┼──────────────────┼───────────────┼────────┤
│ 📊 Dashboard 看板               │ ✅ dashboard.py  │ ✅            │        │
│ 💰 Portfolio 资产总览/组合监控    │ ✅ portfolio.py  │ ✅            │ 深化   │
│ 📈 K 线图表 / 技术指标           │ ✅ kline.py      │ ✅            │        │
│ 🧪 Indicator IDE 指标开发        │ ✅ indicator.py  │ ⚠️ 部分       │ ✅新增  │
│ 🤖 AI 快速分析                   │ ✅ fast_analysis │ ✅            │ 深化   │
│ 💬 AI Chat 对话                  │ ✅ ai_chat.py    │ ⚠️ 部分       │ ✅新增  │
│ 🔮 AI 代码生成 (NL→Python)      │ ✅ 内置          │ ❌            │ ✅新增  │
│ 📝 AI 分析记忆 / 校准            │ ✅ analysis_mem  │ ❌            │ ✅新增  │
│ 🎯 AI Ensemble 多模型集成        │ ✅ 配置项        │ ❌            │ ✅新增  │
│ 🔄 AI Reflection 反思 Worker    │ ✅ reflection.py │ ❌            │ ✅新增  │
│ 📊 策略开发 (Indicator+Script)   │ ✅ strategy.py   │ ✅            │ 深化   │
│ 📋 策略快照 / 版本管理           │ ✅ snapshot      │ ❌            │ ✅新增  │
│ ⚡ Quick Trade 快速交易           │ ✅ quick_trade   │ ❌            │ ✅新增  │
│ 🔁 Pending Order Worker         │ ✅ pending_order │ ❌            │ ✅新增  │
│ 📈 Backtest 回测                 │ ✅ backtest.py   │ ✅            │ 深化   │
│ 🌐 Global Market 全球市场        │ ✅ global_market │ ❌            │ ✅新增  │
│ 🏦 IBKR 美股交易                │ ✅ ibkr.py       │ ❌            │ ✅新增  │
│ 💱 MT5 外汇交易                  │ ✅ mt5.py        │ ❌            │ ✅新增  │
│ 🔮 Polymarket 预测市场           │ ✅ polymarket.py │ ❌            │ ✅新增  │
│ 🔑 Exchange Credentials 凭证管理 │ ✅ credentials   │ ⚠️ 部分       │ 深化   │
│ 💳 Billing 计费系统              │ ✅ billing.py    │ ❌            │ ✅新增  │
│ 💵 USDT 支付                    │ ✅ usdt_payment  │ ❌            │ ✅新增  │
│ 👥 Community 社区                │ ✅ community.py  │ ❌            │ ✅新增  │
│ 🔬 Experiment 实验               │ ✅ experiment.py │ ❌            │ ✅新增  │
│ 🔔 Signal Notifier 信号通知      │ ✅ signal_notify │ ⚠️ 部分       │ 深化   │
│ 📧 Email / SMS 通知             │ ✅ email_service │ ⚠️ 部分       │ 深化   │
│ ⚙️ Settings 系统设置             │ ✅ settings.py   │ ✅            │ 深化   │
│ 👤 User / Auth / OAuth          │ ✅ auth+user.py  │ ✅            │ 深化   │
│ 🛡️ Security (IP 限流/验证码)     │ ✅ security_svc  │ ⚠️ 部分       │ ✅新增  │
│ 🔍 Search (Google/Bing/Tavily)  │ ✅ search.py     │ ❌            │ ✅新增  │
│ 📊 Market Data Collector        │ ✅ collector      │ ⚠️ 部分       │ 深化   │
│ 🏪 Strategy Marketplace 策略市场 │ ✅ community     │ ⚠️ 部分       │ 深化   │
│ 📱 Mobile App (Capacitor)       │ ✅ 提及          │ ❌            │ ✅新增  │
└─────────────────────────────────┴──────────────────┴───────────────┴────────┘
二、需新增的前端页面 (App Router)
Code
app/
├── (auth)/
│   ├── login/page.tsx                   # 登录 (含 OAuth)
│   ├── register/page.tsx                # 注册 (含邀请码/推荐)
│   └── oauth/callback/page.tsx          # OAuth 回调
│
├── (dashboard)/
│   ├── page.tsx                         # ✅ 主看板 Dashboard
│   │
│   ├── portfolio/                       # 💰 资产组合 (深化)
│   │   ├── page.tsx                     # 组合总览
│   │   ├── positions/page.tsx           # 当前持仓
│   │   ├── history/page.tsx             # 交易历史
│   │   ├── alerts/page.tsx              # 🆕 持仓预警规则
│   │   └── monitor/page.tsx             # 🆕 实时监控面板
│   │
│   ├── analysis/                        # 📈 趋势分析
│   │   ├── page.tsx                     # K 线图 + 技术指标
│   │   ├── ai/page.tsx                  # ✅ AI 快速分析
│   │   ├── ai/chat/page.tsx             # 🆕 AI 对话式分析
│   │   ├── ai/memory/page.tsx           # 🆕 AI 分析记忆 & 校准面板
│   │   ├── screener/page.tsx            # 筛选器
│   │   └── global-market/page.tsx       # 🆕 全球市场概览
│   │
│   ├── indicator/                       # 🆕 指标 IDE (核心新增)
│   │   ├── page.tsx                     # 指标列表
│   │   ├── editor/page.tsx              # 🆕 指标代码编辑器 (Monaco)
│   │   ├── ai-generate/page.tsx         # 🆕 AI 自然语言→Python 代码
│   │   └── builtin/page.tsx             # 🆕 内置指标库
│   │
│   ├── trading/                         # 🤖 量化交易
│   │   ├── strategies/
│   │   │   ├── page.tsx                 # 策略列表
│   │   │   ├── [id]/page.tsx            # 策略详情 + 实时监控
│   │   │   ├── create/page.tsx          # 创建策略 (Indicator / Script 两种模式)
│   │   │   ├── snapshots/page.tsx       # 🆕 策略快照/版本管理
│   │   │   └── marketplace/page.tsx     # 🆕 社区策略市场
│   │   ├── backtest/
│   │   │   ├── page.tsx                 # 回测列表
│   │   │   ├── [id]/page.tsx            # 回测结果 + AI 反馈
│   │   │   └── compare/page.tsx         # 🆕 多回测对比
│   │   ├── quick-trade/page.tsx         # 🆕 快速交易面板
│   │   ├── orders/page.tsx              # 订单管理 (含 Pending Orders)
│   │   └── live/page.tsx                # 🆕 实盘运行监控
│   │
│   ├── markets/                         # 🆕 多市场接入 (核心新增)
│   │   ├── crypto/page.tsx              # 加密货币市场
│   │   ├── stocks/page.tsx              # 🆕 美股 (IBKR)
│   │   ├── forex/page.tsx               # 🆕 外汇 (MT5)
│   │   └── prediction/page.tsx          # 🆕 预测市场 (Polymarket)
│   │
│   ├── community/                       # 🆕 社区 (核心新增)
│   │   ├── page.tsx                     # 社区首页
│   │   ├── strategies/page.tsx          # 共享策略
│   │   ├── discussions/page.tsx         # 讨论区
│   │   └── leaderboard/page.tsx         # 🆕 排行榜
│   │
│   ├── billing/                         # 🆕 计费中心 (核心新增)
│   │   ├── page.tsx                     # 套餐 & 积分总览
│   │   ├── membership/page.tsx          # 🆕 会员计划 (月/年/终身)
│   │   ├── credits/page.tsx             # 🆕 积分购买 & 使用记录
│   │   └── payment/page.tsx             # 🆕 USDT TRC20 支付
│   │
│   ├── profile/                         # 👤 个人中心 (深化)
│   │   ├── page.tsx                     # 个人信息
│   │   ├── security/page.tsx            # 安全设置
│   │   ├── credentials/page.tsx         # 🆕 交易所凭证管理 (加密存储)
│   │   ├── notifications/page.tsx       # 🆕 通知渠道 (Telegram/Email/SMS/Discord/Webhook)
│   │   ├── referral/page.tsx            # 🆕 推荐返利
│   │   └── exchange-accounts/page.tsx   # 🆕 开户链接
│   │
│   ├── settings/                        # ⚙️ 系统设置 (深化)
│   │   ├── page.tsx                     # 通用设置
│   │   ├── ai/page.tsx                  # 🆕 AI 配置面板 (LLM 提供商/模型/Ensemble)
│   │   ├── exchange/page.tsx            # 交易所配置
│   │   ├── data-source/page.tsx         # 🆕 数据源配置
│   │   ├── notifications/page.tsx       # 通知配置
│   │   ├── risk/page.tsx                # 风控规则
│   │   ├── proxy/page.tsx               # 🆕 代理设置
│   │   ├── workers/page.tsx             # 🆕 后台 Worker 开关 & 状态
│   │   └── audit/page.tsx               # 审计日志
│   │
│   └── admin/                           # 🆕 管理员面板 (核心新增)
│       ├── users/page.tsx               # 用户管理 (CRUD + 角色)
│       ├── billing/page.tsx             # 计费管理
│       ├── system/page.tsx              # 系统状态 & 健康检查
│       └── env/page.tsx                 # 🆕 运行时环境变量管理
│
└── layout.tsx
三、增补的技术栈
前端新增
技术	用途	对应 QuantDinger 功能
KLineCharts	备选 K 线库 (QuantDinger 选用)	K 线图表渲染
@capacitor/core	🆕 移动端封装 (iOS/Android)	移动端 App
react-markdown + remark-gfm	🆕 AI 分析结果 Markdown 渲染	AI Chat / 快速分析
crypto-js	🆕 前端凭证加密传输	交易所 API Key 管理
qrcode.react	🆕 USDT 支付二维码	USDT TRC20 支付
@tanstack/react-virtual	🆕 虚拟列表 (社区帖子流)	社区列表
cmdk	🆕 命令面板 (⌘K 快捷搜索)	全局搜索
sonner	🆕 Toast 通知组件	信号通知/操作反馈
date-fns	🆕 日期处理	时间范围选择器
后端 (Python) 新增
技术	用途	对应 QuantDinger 功能
ib_insync	🆕 IBKR (盈透证券) 交易接口	美股交易
MetaTrader5 (mt5)	🆕 MT5 外汇交易接口	外汇交易
Fernet (cryptography)	🆕 交易所凭证加密	credentials 加密存储
google-api-python-client	🆕 Google Custom Search	AI 联网搜索
tavily-python	🆕 Tavily AI 搜索	AI 分析上下文增强
py-clob-client	🆕 Polymarket 客户端	预测市场分析
bip-utils	🆕 USDT HD 钱包地址派生	USDT 支付地址生成
tronpy / trongrid	🆕 TRON 链上支付验证	USDT TRC20 支付确认
APScheduler	🆕 后台调度器	Reflection Worker / Portfolio Monitor
Twilio	🆕 短信验证码	SMS 通知
discord.py / python-telegram-bot	🆕 社交平台通知	Discord/Telegram 通知
后端 (Go) 新增
技术	用途	说明
go-turnstile	🆕 Cloudflare Turnstile 验证	人机验证
gomail	🆕 SMTP 邮件发送	邮件通知
go-tron-sdk	🆕 TRON 链交互	USDT 支付验证
四、增补的后端服务模块
Code
services/
├── gateway/                          # API 网关 (Go)
├── auth-service/                     # 认证服务 (Go) — 深化 OAuth + Turnstile
├── user-service/                     # 用户服务 (Go) — 深化 RBAC (admin/manager/user/viewer)
├── market-service/                   # 行情服务 (Go)
├── trade-engine/                     # 交易引擎 (Go)
├── asset-service/                    # 资产服务 (Go) — 深化 Portfolio Monitor
├── notification-service/             # 通知服务 (Go) — 深化 Telegram/Discord/SMS/Webhook
├── report-service/                   # 报表服务 (Go)
│
├── quant-engine/                     # 量化引擎 (Python)
├── ai-service/                       # AI 分析服务 (Python) — 深化 Ensemble + Calibration + Reflection
│
│   以下为 🆕 新增服务:
│
├── credential-service/  (Go)         # 🆕 交易所凭证管理 (AES/Fernet 加密)
├── billing-service/     (Go)         # 🆕 计费系统 (会员/积分/支付)
├── payment-service/     (Go/Python)  # 🆕 USDT TRC20 支付 (链上验证)
├── community-service/   (Go)         # 🆕 社区 (策略分享/讨论/排行)
├── search-service/      (Python)     # 🆕 联网搜索 (Google/Bing/Tavily) — AI 上下文增强
├── broker-adapter/      (Python)     # 🆕 券商适配器
│   ├── ibkr/                         #     IBKR 盈透 (美股)
│   ├── mt5/                          #     MT5 (外汇)
│   └── polymarket/                   #     Polymarket (预测市场)
├── worker-service/      (Python)     # 🆕 后台 Worker 集合
│   ├── pending_order_worker          #     挂单轮询 & 执行
│   ├── portfolio_monitor             #     持仓监控 & 预警
│   ├── reflection_worker             #     AI 分析复盘
│   └── usdt_payment_worker           #     USDT 支付到账确认
└── experiment-service/  (Python)     # 🆕 A/B 实验 (策略参数优化)
五、增补的数据库表
SQL
-- ==================== 🆕 AI 分析记忆 ====================
CREATE TABLE ai_analysis_memory (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    symbol          VARCHAR(50) NOT NULL,
    timeframe       VARCHAR(10),
    analysis_type   VARCHAR(50),           -- fast/ensemble/chat
    llm_provider    VARCHAR(50),
    llm_model       VARCHAR(100),
    prompt_tokens   INT,
    completion_tokens INT,
    result          JSONB NOT NULL,         -- 结构化分析结果
    signal          VARCHAR(20),            -- BUY/SELL/HOLD
    confidence      DECIMAL(5,2),
    user_feedback   VARCHAR(20),            -- positive/negative
    validated       BOOLEAN DEFAULT FALSE,  -- 是否已验证
    validated_at    TIMESTAMPTZ,
    actual_outcome  JSONB,                  -- 实际结果 (用于校准)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 AI 校准 ====================
CREATE TABLE ai_calibration (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market          VARCHAR(50) NOT NULL,
    signal_type     VARCHAR(20) NOT NULL,
    threshold       DECIMAL(5,2),
    accuracy        DECIMAL(5,2),
    sample_size     INT,
    calibrated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 交易所凭证 (加密存储) ====================
CREATE TABLE exchange_credentials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    exchange        VARCHAR(50) NOT NULL,
    label           VARCHAR(100),
    encrypted_config TEXT NOT NULL,          -- Fernet 加密后的 JSON
    permissions     JSONB DEFAULT '["read"]',
    is_active       BOOLEAN DEFAULT TRUE,
    last_verified   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 计费系统 ====================
CREATE TABLE memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) UNIQUE,
    plan            VARCHAR(20) NOT NULL,    -- monthly/yearly/lifetime
    credits_balance INT DEFAULT 0,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    auto_renew      BOOLEAN DEFAULT FALSE
);

CREATE TABLE credit_transactions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    amount          INT NOT NULL,            -- 正=充值, 负=消费
    type            VARCHAR(50) NOT NULL,    -- purchase/consume/bonus/referral
    description     VARCHAR(200),
    reference_id    VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usdt_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    amount_usd      DECIMAL(10,2) NOT NULL,
    amount_usdt     DECIMAL(20,6) NOT NULL,
    chain           VARCHAR(10) DEFAULT 'TRC20',
    deposit_address VARCHAR(100) NOT NULL,
    tx_hash         VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'pending',  -- pending/confirmed/expired
    expires_at      TIMESTAMPTZ,
    confirmed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 社区 ====================
CREATE TABLE community_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    type            VARCHAR(20) NOT NULL,    -- strategy_share/discussion/signal
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    strategy_id     UUID REFERENCES strategies(id),
    likes_count     INT DEFAULT 0,
    comments_count  INT DEFAULT 0,
    is_pinned       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 策略快照 ====================
CREATE TABLE strategy_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id     UUID REFERENCES strategies(id),
    version         INT NOT NULL,
    source_code     TEXT NOT NULL,
    config          JSONB,
    description     VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (strategy_id, version)
);

-- ==================== 🆕 通知渠道配置 ====================
CREATE TABLE notification_channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    channel_type    VARCHAR(20) NOT NULL,    -- telegram/email/sms/discord/webhook
    config          JSONB NOT NULL,          -- 加密后的配置
    is_active       BOOLEAN DEFAULT TRUE,
    verified        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 🆕 信号通知记录 ====================
CREATE TABLE signal_notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    strategy_id     UUID,
    signal_type     VARCHAR(20) NOT NULL,    -- buy/sell/alert/stop_loss
    symbol          VARCHAR(50),
    message         TEXT,
    channels_sent   JSONB,                   -- ["telegram","email"]
    status          VARCHAR(20) DEFAULT 'sent',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
六、增补的 AI 能力矩阵
Code
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI 能力体系 (对齐 QuantDinger)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1️⃣  Fast Analysis (快速分析)                                           │
│  ├── 多因子结构化分析 (价格/K线/宏观/新闻)                                 │
│  ├── 联网搜索增强 (Google/Bing/Tavily)                                   │
│  ├── 多 LLM 提供商 (OpenRouter/OpenAI/Gemini/DeepSeek/Grok)             │
│  └── 信号输出: BUY / SELL / HOLD + 置信度                                │
│                                                                         │
│  2️⃣  AI Code Generation (代码生成)     🆕                               │
│  ├── 自然语言 → IndicatorStrategy Python 代码                            │
│  ├── 自然语言 → ScriptStrategy 代码 + 参数配置                           │
│  └── 迭代优化 (基于回测反馈)                                             │
│                                                                         │
│  3️⃣  AI Chat (对话式分析)              🆕                               │
│  ├── 多轮对话上下文保持                                                   │
│  ├── 结合实时行情数据回答                                                 │
│  └── 流式输出 (SSE)                                                     │
│                                                                         │
│  4️⃣  Analysis Memory (分析记忆)        🆕                               │
│  ├── 历史分析持久化存储                                                   │
│  ├── 相似模式检索 (RAG)                                                  │
│  ├── 用户反馈收集                                                        │
│  └── 为未来校准提供数据基础                                               │
│                                                                         │
│  5️⃣  AI Ensemble (多模型集成)          🆕                               │
│  ├── 多模型并行分析 (e.g., GPT-4o + GPT-4o-mini)                        │
│  ├── 结果聚合 + 置信度加权                                               │
│  └── 可配置模型列表                                                      │
│                                                                         │
│  6️⃣  Confidence Calibration (置信校准) 🆕                               │
│  ├── 基于历史验证结果调整 BUY/SELL 阈值                                   │
│  ├── 按市场分类校准 (Crypto/Stock/Forex)                                 │
│  └── 最小样本量控制                                                      │
│                                                                         │
│  7️⃣  Reflection Worker (反思 Worker)   🆕                               │
│  ├── 后台定时运行 (默认 24h)                                             │
│  ├── 验证历史分析 vs 实际结果                                             │
│  └── 自动反馈循环 → 改进分析质量                                          │
│                                                                         │
│  8️⃣  AI-Assisted Backtest Feedback     🆕                               │
│  ├── 回测结果 → AI 生成改进建议                                           │
│  ├── 参数调优推荐                                                        │
│  └── 风险评估                                                            │
│                                                                         │
│  9️⃣  Polymarket Research               🆕                               │
│  ├── AI 观点 vs 市场隐含概率对比                                          │
│  ├── 分歧检测 + 机会评分                                                  │
│  └── 批量分析 Worker                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
七、增补的通知渠道
Code
┌────────────────────────────────────────────────────────────────┐
│                    通知系统 (对齐 QuantDinger)                   │
├──────────┬──────────────────────────────────────────────────────┤
│ 渠道      │ 触发场景                                            │
├──────────┼──────────────────────────────────────────────────────┤
│ Telegram │ 交易信号 · 止损触发 · 策略状态变化 · AI 分析完成       │
│ Email    │ 每日报告 · 安全告警 · 密码变更 · 会员到期提醒          │
│ SMS      │ 🆕 验证码 · 紧急止损 · 大额交易确认                   │
│ Discord  │ 🆕 策略信号频道推送 · 社区通知                        │
│ Webhook  │ 🆕 自定义集成 (Slack/企业微信/自建系统)               │
└──────────┴──────────────────────────────────────────────────────┘
八、增补的用户角色 (RBAC)
Code
┌──────────┬──────────────────────────────────────────────────────┐
│ 角色      │ 权限                                                │
├──────────┼──────────────────────────────────────────────────────┤
│ admin    │ 全部权限 + 用户管理 + 系统设置 + 环境变量 + 计费管理  │
│ manager  │ 策略 · 回测 · 组合 · 交易 · 设置 (无用户管理)        │
│ user     │ 策略 · 回测 · 组合 · 交易 (仅自己的数据)             │
│ viewer   │ 🆕 仅看板只读 (适合投资者/观察者)                     │
└──────────┴──────────────────────────────────────────────────────┘
九、终版技术栈全景图
Code
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─── Frontend ──────────────────────────────────────────────────────────┐ │
│   │  React 19 · Next.js 15 · TypeScript 5.5+                             │ │
│   │  TailwindCSS 4 · shadcn/ui · Framer Motion · next-themes             │ │
│   │  TradingView Lightweight Charts · Apache ECharts (按需引入)            │ │
│   │  Zustand · TanStack Query v5 · TanStack Table v8 · Socket.IO Client  │ │
│   │  React Hook Form · Zod · Monaco Editor · dnd-kit · cmdk · nuqs       │ │
│   │  Auth.js v5 · next-intl · react-markdown · qrcode.react · sonner     │ │
│   │  Vitest · Playwright · Turbopack · pnpm                              │ │
│   │  🆕 Capacitor (Mobile App)                                           │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─── Backend (Go 1.24) ────────────────────────────────────────────────┐ │
│   │  Gin · gRPC · nhooyr/websocket                                       │ │
│   │  GORM v2 · sqlc · go-redis v9 · sarama · watermill                   │ │
│   │  golang-jwt v5 · validator · ratelimit                                │ │
│   │  Viper · Zap · Wire · cron v3 · swaggo                               │ │
│   │  testify · gomock                                                     │ │
│   │  🆕 gomail · go-turnstile · go-tron-sdk                              │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─── Backend (Python 3.12) ────────────────────────────────────────────┐ │
│   │  FastAPI · Uvicorn · grpcio                                           │ │
│   │  Backtrader / vnpy · Pandas 2 · NumPy 2 · TA-Lib · ccxt              │ │
│   │  LangChain · OpenAI/Claude/Gemini/DeepSeek API · PyTorch 2           │ │
│   │  scikit-learn · Celery · Plotly                                       │ │
│   │  pytest · hypothesis                                                  │ │
│   │  🆕 ib_insync (IBKR) · MetaTrader5 · Fernet (cryptography)          │ │
│   │  🆕 tavily-python · google-api-python-client · bip-utils · tronpy   │ │
│   │  🆕 APScheduler · Twilio · python-telegram-bot · discord.py          │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─── Data Layer ───────────────────────────────────────────────────────┐ │
│   │  PostgreSQL 16 · TimescaleDB · Redis 7 Cluster                       │ │
│   │  Apache Kafka · ClickHouse · MinIO · Meilisearch                     │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─── DevOps & Infra ──────────────────────────────────────────────────┐ │
│   │  Docker · Kubernetes · Helm · Terraform                              │ │
│   │  GitHub Actions                                                       │ │
│   │  Prometheus · Grafana · Loki · OpenTelemetry · Jaeger                │ │
│   │  HashiCorp Vault · Cloudflare                                         │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
十、与 QuantDinger 的关键差异
维度	QuantDinger (现有)	我们的方案
前端框架	Vue + Ant Design Vue	React 19 + Next.js 15 + shadcn/ui
后端框架	Flask (单体 Python)	Go 微服务 + Python 计算服务 (分工)
K线图表	KLineCharts + ECharts	TradingView Lightweight Charts + ECharts
数据库	PostgreSQL 单库	PostgreSQL + TimescaleDB + ClickHouse (分层)
消息队列	无 (Redis 做简单协调)	Kafka (高吞吐事件流)
时序数据	PostgreSQL 通用表	TimescaleDB Hypertable (自动分区)
实时通信	HTTP 轮询为主	WebSocket + SSE (真实时推送)
部署	Docker Compose	Docker Compose (开发) + K8s (生产)
移动端	Capacitor (Vue)	Capacitor (React) 或 React Native
AI 框架	直接 HTTP 调用 LLM	LangChain 编排 (更复杂的 Agent 链)
核心理念: 保留 QuantDinger 已验证的完整功能集（AI 分析 + 多市场 + 策略双模式 + 计费 + 社区），但在架构层面用 Go 重写高并发链路、用 Next.js 重写前端获得更好的 SEO 和 DX，用分层存储应对未来数据增长。

如果你想让我开始在 brokermr810/QuantDinger 仓库中创建 PR 来实现某个具体模块，请告诉我优先级！

You said: 增补全站支持多国语言切换，主题黑/白/自适应切换，前端UI支持多设备(电脑，手机，平板，大面板)
增补全站支持多国语言切换，主题黑/白/自适应切换，前端UI支持多设备(电脑，手机，平板，大面板)
Copilot said: # 增补方案 — 国际化 + 主题系统 +
增补方案 — 国际化 + 主题系统 + 全设备响应式
一、多国语言 (i18n) 方案
1. 技术选型
技术	用途	选型理由
next-intl	Next.js 15 App Router 国际化	原生支持 RSC/Server Components，类型安全
Zod + next-intl	表单校验信息国际化	校验错误消息跟随语言切换
Intl API (浏览器原生)	数字/货币/日期/时间格式化	零依赖，各地区本地化格式
ICU MessageFormat	复数/性别/选择等复杂翻译	next-intl 内置支持
2. 支持语言
Code
┌──────────────────────────────────────────────────┐
│              语言支持矩阵                          │
├──────┬───────────────┬─────────┬─────────────────┤
│ 代码  │ 语言           │ 优先级   │ 特殊处理         │
├──────┼───────────────┼─────────┼─────────────────┤
│ zh   │ 简体中文        │ P0      │ 默认语言          │
│ en   │ English        │ P0      │                   │
│ zh-TW│ 繁體中文        │ P1      │                   │
│ ja   │ 日本語          │ P1      │                   │
│ ko   │ 한국어          │ P1      │                   │
│ es   │ Español        │ P2      │ RTL: 否           │
│ ar   │ العربية        │ P2      │ RTL: 是 ← 需特殊  │
│ ru   │ Русский        │ P2      │                   │
│ pt   │ Português      │ P2      │                   │
│ fr   │ Français       │ P2      │                   │
└──────┴───────────────┴─────────┴─────────────────┘
3. 目录结构
Code
frontend/
├── messages/                          # 翻译文件
│   ├── zh.json                        # 简体中文 (主翻译源)
│   ├── en.json                        # English
│   ├── zh-TW.json
│   ├── ja.json
│   ├── ko.json
│   ├── es.json
│   ├── ar.json
│   ├── ru.json
│   ├── pt.json
│   └── fr.json
│
├── i18n/
│   ├── config.ts                      # 语言配置 (支持列表/默认语言/fallback)
│   ├── request.ts                     # next-intl server 端配置
│   ├── routing.ts                     # URL 路由国际化策略
│   └── formats.ts                     # 数字/货币/日期格式定义
│
├── app/
│   └── [locale]/                      # ← 所有页面嵌套在 locale 动态段下
│       ├── layout.tsx
│       ├── (auth)/...
│       └── (dashboard)/...
│
├── components/
│   └── layout/
│       └── LocaleSwitcher.tsx         # 语言切换器组件
│
└── middleware.ts                       # next-intl middleware (自动检测/重定向)
4. 翻译文件结构
JSON
// messages/zh.json — 按模块分命名空间
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "search": "搜索",
    "loading": "加载中...",
    "noData": "暂无数据",
    "success": "操作成功",
    "error": "操作失败",
    "retry": "重试",
    "back": "返回",
    "more": "更多",
    "all": "全部",
    "export": "导出",
    "import": "导入"
  },

  "nav": {
    "dashboard": "看板",
    "portfolio": "资产总览",
    "analysis": "趋势分析",
    "indicator": "指标 IDE",
    "trading": "量化交易",
    "markets": "全球市场",
    "community": "社区",
    "billing": "计费中心",
    "profile": "个人中心",
    "settings": "系统设置",
    "admin": "管理后台"
  },

  "dashboard": {
    "totalAssets": "总资产",
    "todayPnl": "今日盈亏",
    "todayPnlPercent": "今日收益率",
    "activeStrategies": "运行中策略",
    "openPositions": "持仓数量",
    "recentTrades": "最近交易",
    "marketOverview": "市场概览",
    "equityCurve": "权益曲线"
  },

  "trading": {
    "buy": "买入",
    "sell": "卖出",
    "long": "做多",
    "short": "做空",
    "marketOrder": "市价单",
    "limitOrder": "限价单",
    "stopLoss": "止损",
    "takeProfit": "止盈",
    "quantity": "数量",
    "price": "价格",
    "leverage": "杠杆",
    "placeOrder": "下单",
    "cancelOrder": "撤单",
    "orderHistory": "历史委托",
    "openOrders": "当前委托",
    "filledOrders": "已成交",
    "pendingOrders": "挂单中"
  },

  "strategy": {
    "create": "创建策略",
    "name": "策略名称",
    "type": "策略类型",
    "indicatorStrategy": "指标策略",
    "scriptStrategy": "脚本策略",
    "status": "状态",
    "running": "运行中",
    "stopped": "已停止",
    "draft": "草稿",
    "startStrategy": "启动策略",
    "stopStrategy": "停止策略",
    "backtest": "回测",
    "backtestResult": "回测结果",
    "winRate": "胜率",
    "sharpeRatio": "夏普比率",
    "maxDrawdown": "最大回撤",
    "totalReturn": "总收益",
    "annualReturn": "年化收益",
    "snapshot": "策略快照",
    "version": "版本"
  },

  "ai": {
    "fastAnalysis": "快速分析",
    "aiChat": "AI 对话",
    "codeGeneration": "代码生成",
    "analyzing": "分析中...",
    "confidence": "置信度",
    "signal": "信号",
    "memory": "分析记忆",
    "ensemble": "多模型集成",
    "feedback": "反馈",
    "helpful": "有帮助",
    "notHelpful": "没帮助",
    "generateIndicator": "生成指标代码",
    "generateStrategy": "生成策略代码",
    "describeYourIdea": "用自然语言描述你的交易想法..."
  },

  "portfolio": {
    "totalValue": "总市值",
    "unrealizedPnl": "未实现盈亏",
    "realizedPnl": "已实现盈亏",
    "positions": "持仓",
    "allocation": "资产配置",
    "symbol": "交易对",
    "entryPrice": "开仓均价",
    "currentPrice": "当前价格",
    "amount": "持仓量",
    "pnlPercent": "盈亏比例",
    "closePosition": "平仓",
    "monitor": "组合监控",
    "alerts": "持仓预警"
  },

  "billing": {
    "membership": "会员计划",
    "credits": "积分",
    "monthly": "月付",
    "yearly": "年付",
    "lifetime": "终身",
    "currentPlan": "当前套餐",
    "upgrade": "升级",
    "creditsBalance": "积分余额",
    "purchaseCredits": "购买积分",
    "payWithUSDT": "USDT 支付",
    "paymentPending": "等待支付...",
    "paymentConfirmed": "支付已确认"
  },

  "notification": {
    "channels": "通知渠道",
    "telegram": "Telegram",
    "email": "邮件",
    "sms": "短信",
    "discord": "Discord",
    "webhook": "Webhook",
    "enabled": "已启用",
    "disabled": "已禁用",
    "testSend": "发送测试"
  },

  "format": {
    "currency": "{value, number, ::currency/USD}",
    "percent": "{value, number, ::percent}",
    "decimal": "{value, number, ::precision-integer}",
    "date": "{date, date, medium}",
    "dateTime": "{date, date, medium} {date, time, short}",
    "relativeTime": "{date, relative}"
  }
}
5. 核心实现
TypeScript
// i18n/config.ts
export const locales = [
  'zh', 'en', 'zh-TW', 'ja', 'ko',
  'es', 'ar', 'ru', 'pt', 'fr'
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const localeNames: Record<Locale, string> = {
  'zh':    '简体中文',
  'en':    'English',
  'zh-TW': '繁體中文',
  'ja':    '日本語',
  'ko':    '한국어',
  'es':    'Español',
  'ar':    'العربية',
  'ru':    'Русский',
  'pt':    'Português',
  'fr':    'Français',
};

// RTL 语言标记
export const rtlLocales: Locale[] = ['ar'];

export const localeFlags: Record<Locale, string> = {
  'zh':    '🇨🇳',
  'en':    '🇺🇸',
  'zh-TW': '🇹🇼',
  'ja':    '🇯🇵',
  'ko':    '🇰🇷',
  'es':    '🇪🇸',
  'ar':    '🇸🇦',
  'ru':    '🇷🇺',
  'pt':    '🇧🇷',
  'fr':    '🇫🇷',
};

// 数字/货币/日期 本地化格式
export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  'zh':    { style: 'currency', currency: 'CNY' },
  'en':    { style: 'currency', currency: 'USD' },
  'ja':    { style: 'currency', currency: 'JPY' },
  'ko':    { style: 'currency', currency: 'KRW' },
  // ...
};
TypeScript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',  // 默认语言不加前缀: / → zh, /en → en
  localeDetection: true,       // 自动检测浏览器语言
});
TypeScript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',  // 排除 API/静态资源
  ],
};
TSX
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { rtlLocales } from '@/i18n/config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as any) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
TSX
// components/layout/LocaleSwitcher.tsx
"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleSwitch(l)}
            className={locale === l ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[l]}</span>
            <span>{localeNames[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
6. 页面中使用
TSX
// Server Component 中使用
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div>
      <h1>{t('totalAssets')}</h1>    {/* 总资产 / Total Assets */}
      <p>{t('todayPnl')}</p>          {/* 今日盈亏 / Today P&L */}
    </div>
  );
}

// Client Component 中使用
"use client";
import { useTranslations, useFormatter } from 'next-intl';

export function AssetCard({ value }: { value: number }) {
  const t = useTranslations('portfolio');
  const format = useFormatter();

  return (
    <div>
      <span>{t('totalValue')}</span>
      <span>{format.number(value, { style: 'currency', currency: 'USD' })}</span>
      {/* zh: $12,345.67 → ¥12,345.67 (根据 locale 自动切换) */}
    </div>
  );
}
7. 金融数据本地化格式
TSX
// i18n/formats.ts — 金融场景专用格式化
import { useFormatter, useLocale } from 'next-intl';

export function useFinanceFormatter() {
  const format = useFormatter();
  const locale = useLocale();

  return {
    // 价格: $1,234.5678 / ¥1,234.5678
    price: (value: number, decimals = 2) =>
      format.number(value, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),

    // 百分比: +12.34% / -5.67%
    percent: (value: number) =>
      format.number(value / 100, {
        style: 'percent',
        minimumFractionDigits: 2,
        signDisplay: 'exceptZero',
      }),

    // 大数缩写: 1.2M / 3.4B (英文) | 120万 / 34亿 (中文)
    compact: (value: number) => {
      if (['zh', 'zh-TW'].includes(locale)) {
        if (value >= 1e8) return `${(value / 1e8).toFixed(2)}亿`;
        if (value >= 1e4) return `${(value / 1e4).toFixed(2)}万`;
        return value.toFixed(2);
      }
      return format.number(value, { notation: 'compact', maximumFractionDigits: 2 });
    },

    // 日期: 2026-04-13 (zh) / Apr 13, 2026 (en) / 2026年4月13日 (ja)
    date: (date: Date | string) =>
      format.dateTime(new Date(date), { dateStyle: 'medium' }),

    // 时间: 14:30:00 (zh) / 2:30 PM (en)
    time: (date: Date | string) =>
      format.dateTime(new Date(date), { timeStyle: 'medium' }),

    // 相对时间: 3分钟前 / 3 minutes ago
    relative: (date: Date | string) =>
      format.relativeTime(new Date(date)),
  };
}
二、主题系统 (黑/白/自适应)
1. 技术选型
技术	用途
next-themes	主题状态管理 (dark/light/system)，SSR 无闪烁
TailwindCSS 4 dark:	暗色模式类名
CSS Variables	语义化颜色变量 (跨主题一致性)
shadcn/ui	自带完整暗色主题支持
2. 主题模式
Code
┌───────────────────────────────────────────────────────┐
│                    主题模式                             │
├───────────┬───────────────────────────────────────────┤
│  light    │ 亮色主题 (白底深字)                         │
│  dark     │ 暗色主题 (深底浅字) — 交易场景默认           │
│  system   │ 自适应系统偏好 (跟随 OS / 浏览器设置)       │
└───────────┴───────────────────────────────────────────┘
3. 核心实现
TSX
// app/[locale]/layout.tsx
import { ThemeProvider } from 'next-themes';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const dir = rtlLocales.includes(locale as any) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"            // TailwindCSS dark: 模式
          defaultTheme="system"        // 默认跟随系统
          enableSystem                 // 启用 system 选项
          disableTransitionOnChange    // 防止切换时闪烁
          storageKey="qd-theme"        // localStorage key
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
TSX
// components/layout/ThemeSwitcher.tsx
"use client";

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('settings.theme');

  const themes = [
    { key: 'light',  icon: Sun,     label: t('light') },
    { key: 'dark',   icon: Moon,    label: t('dark') },
    { key: 'system', icon: Monitor, label: t('system') },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ key, icon: Icon, label }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key)}
            className={theme === key ? 'bg-accent' : ''}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
4. 金融场景专属颜色
CSS
/* globals.css — 语义化 CSS 变量 */

@layer base {
  :root {
    /* ===== 基础色 ===== */
    --background:           0 0% 100%;
    --foreground:           222 47% 11%;
    --card:                 0 0% 100%;
    --card-foreground:      222 47% 11%;
    --popover:              0 0% 100%;
    --popover-foreground:   222 47% 11%;
    --primary:              221 83% 53%;
    --primary-foreground:   210 40% 98%;
    --muted:                210 40% 96%;
    --muted-foreground:     215 16% 47%;
    --border:               214 32% 91%;

    /* ===== 金融专属色 ===== */
    --profit:               142 71% 45%;     /* 盈利 — 绿色 */
    --loss:                 0 84% 60%;        /* 亏损 — 红色 */
    --warning:              38 92% 50%;       /* 预警 — 橙色 */
    --info:                 199 89% 48%;      /* 信息 — 蓝色 */

    /* ===== K线色 (国际标准: 涨绿跌红) ===== */
    --candle-up:            142 71% 45%;
    --candle-down:          0 84% 60%;
    --candle-up-bg:         142 71% 45% / 0.1;
    --candle-down-bg:       0 84% 60% / 0.1;

    /* ===== 图表网格 ===== */
    --chart-grid:           0 0% 90%;
    --chart-crosshair:      0 0% 60%;
    --chart-tooltip-bg:     0 0% 100%;

    /* ===== 信号色 ===== */
    --signal-buy:           142 71% 45%;
    --signal-sell:          0 84% 60%;
    --signal-hold:          38 92% 50%;
  }

  .dark {
    --background:           222 47% 5%;
    --foreground:           210 40% 98%;
    --card:                 222 47% 8%;
    --card-foreground:      210 40% 98%;
    --popover:              222 47% 8%;
    --popover-foreground:   210 40% 98%;
    --primary:              217 91% 60%;
    --primary-foreground:   222 47% 5%;
    --muted:                217 33% 17%;
    --muted-foreground:     215 20% 65%;
    --border:               217 33% 17%;

    /* ===== 金融专属色 (暗色) ===== */
    --profit:               142 71% 50%;
    --loss:                 0 84% 62%;
    --warning:              38 92% 56%;
    --info:                 199 89% 55%;

    --candle-up:            160 84% 39%;
    --candle-down:          0 72% 51%;
    --candle-up-bg:         160 84% 39% / 0.15;
    --candle-down-bg:       0 72% 51% / 0.15;

    --chart-grid:           217 33% 17%;
    --chart-crosshair:      215 20% 45%;
    --chart-tooltip-bg:     222 47% 12%;
  }

  /* ===== 中国用户特殊处理: 涨红跌绿 ===== */
  [lang="zh"] {
    --candle-up:            0 84% 60%;       /* 涨 = 红 */
    --candle-down:          142 71% 45%;     /* 跌 = 绿 */
    --profit:               0 84% 60%;
    --loss:                 142 71% 45%;
  }
  [lang="zh"].dark {
    --candle-up:            0 72% 51%;
    --candle-down:          160 84% 39%;
    --profit:               0 72% 55%;
    --loss:                 160 84% 42%;
  }
}
CSS
/* TailwindCSS 4 自定义工具类 */
@utility profit { color: hsl(var(--profit)); }
@utility loss { color: hsl(var(--loss)); }
@utility bg-profit { background-color: hsl(var(--profit) / 0.1); }
@utility bg-loss { background-color: hsl(var(--loss) / 0.1); }
TSX
// 使用示例: 盈亏数字自动着色
function PnLValue({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? 'profit' : 'loss'}>
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
三、全设备响应式 (电脑 / 平板 / 手机 / 大面板)
1. 断点系统
Code
┌─────────────────────────────────────────────────────────────────────┐
│                      设备断点矩阵                                    │
├────────────┬────────────┬──────────────────┬───────────────────────┤
│ 断点名称    │ TailwindCSS │ 屏幕宽度          │ 典型设备              │
├────────────┼────────────┼──────────────────┼───────────────────────┤
│ mobile     │ (默认)      │ < 640px          │ iPhone / Android 手机 │
│ sm         │ sm:         │ ≥ 640px          │ 大屏手机横屏           │
│ md         │ md:         │ ≥ 768px          │ iPad Mini / 平板竖屏  │
│ lg         │ lg:         │ ≥ 1024px         │ iPad Pro / 平板横屏   │
│ xl         │ xl:         │ ≥ 1280px         │ 笔记本 / 桌面显示器   │
│ 2xl        │ 2xl:        │ ≥ 1536px         │ 大屏显示器            │
│ 3xl        │ 3xl:        │ ≥ 1920px         │ 🆕 2K 大面板          │
│ 4xl        │ 4xl:        │ ≥ 2560px         │ 🆕 4K / 超宽屏面板    │
└────────────┴────────────┴──────────────────┴───────────────────────┘
TypeScript
// tailwind.config.ts — 扩展断点
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    screens: {
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
      '3xl': '1920px',   // 🆕 大面板
      '4xl': '2560px',   // 🆕 超大面板
    },
  },
};
2. 各设备布局策略
Code
📱 手机 (< 768px)
┌──────────────────┐
│  顶部导航 (汉堡)  │
├──────────────────┤
│                  │
│   主内容区域      │
│   (单列全宽)      │
│                  │
├──────────────────┤
│  底部标签栏       │
│  🏠 📊 🤖 💰 👤  │
└──────────────────┘

📱 平板竖屏 (768px - 1023px)
┌────┬─────────────┐
│ 侧 │             │
│ 栏 │   主内容区域  │
│ 图 │   (双列网格)  │
│ 标 │             │
│    │             │
└────┴─────────────┘

💻 桌面 (1024px - 1919px)
┌──────┬───────────────────────────┐
│ 侧边 │                           │
│ 导航 │       主内容区域            │
│ 栏   │       (2-3列网格)          │
│      │                           │
│ 展开 │                           │
│ 模式 │                           │
└──────┴───────────────────────────┘

🖥️ 大面板 (≥ 1920px)
┌──────┬──────────────────┬───────────────┐
│ 侧边 │                  │               │
│ 导航 │   主交易区域       │   侧边信息栏   │
│ 栏   │   (K线/订单簿)    │   (持仓/信号)  │
│      │                  │               │
│ 展开 │   4列网格         │   实时数据面板  │
│ 模式 │                  │               │
└──────┴──────────────────┴───────────────┘
3. 响应式侧边栏
TSX
// components/layout/AppSidebar.tsx
"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Sheet, SheetContent, SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, PieChart, TrendingUp, Code2,
  Bot, Globe, Users, CreditCard, User, Settings,
  Menu, ChevronLeft, ChevronRight,
} from 'lucide-react';

export function AppSidebar() {
  const t = useTranslations('nav');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const [collapsed, setCollapsed] = useState(isTablet);

  const navItems = [
    { key: 'dashboard',  icon: LayoutDashboard, href: '/' },
    { key: 'portfolio',  icon: PieChart,        href: '/portfolio' },
    { key: 'analysis',   icon: TrendingUp,      href: '/analysis' },
    { key: 'indicator',  icon: Code2,           href: '/indicator' },
    { key: 'trading',    icon: Bot,             href: '/trading' },
    { key: 'markets',    icon: Globe,           href: '/markets' },
    { key: 'community',  icon: Users,           href: '/community' },
    { key: 'billing',    icon: CreditCard,      href: '/billing' },
    { key: 'profile',    icon: User,            href: '/profile' },
    { key: 'settings',   icon: Settings,        href: '/settings' },
  ];

  // 📱 手机: Sheet (抽屉)
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map(({ key, icon: Icon, href }) => (
              <a key={key} href={href}
                 className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent">
                <Icon className="h-5 w-5" />
                <span>{t(key)}</span>
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  // 💻 桌面/平板: 可折叠侧边栏
  return (
    <aside className={`
      sticky top-0 h-screen border-r border-border bg-card
      transition-all duration-300 ease-in-out
      ${collapsed ? 'w-16' : 'w-60'}
    `}>
      <div className="flex h-14 items-center justify-between px-3 border-b">
        {!collapsed && (
          <span className="text-lg font-bold">QuantDinger</span>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ key, icon: Icon, href }) => (
          <a key={key} href={href}
             className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent"
             title={collapsed ? t(key) : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(key)}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}
4. 手机底部导航栏
TSX
// components/layout/MobileTabBar.tsx
"use client";

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Bot, PieChart, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const tabs = [
    { key: 'dashboard', icon: LayoutDashboard, href: '/' },
    { key: 'analysis',  icon: TrendingUp,      href: '/analysis' },
    { key: 'trading',   icon: Bot,             href: '/trading' },
    { key: 'portfolio', icon: PieChart,        href: '/portfolio' },
    { key: 'profile',   icon: User,            href: '/profile' },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      border-t border-border bg-card/95 backdrop-blur
      safe-area-inset-bottom         /* iOS 安全区域 */
      md:hidden                      /* 仅手机显示 */
    ">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ key, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <a key={key} href={href}
               className={cn(
                 "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg",
                 "transition-colors text-xs",
                 isActive
                   ? "text-primary"
                   : "text-muted-foreground hover:text-foreground"
               )}>
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{t(key)}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
5. Dashboard 响应式网格
TSX
// app/[locale]/(dashboard)/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* === 统计卡片 === */}
      <div className="
        grid gap-4
        grid-cols-2                   /* 📱 手机: 2列 */
        md:grid-cols-4                /* 📱 平板: 4列 */
        3xl:grid-cols-6               /* 🖥️ 大面板: 6列 */
      ">
        <StatCard title={t('totalAssets')} />
        <StatCard title={t('todayPnl')} />
        <StatCard title={t('activeStrategies')} />
        <StatCard title={t('openPositions')} />
        {/* 大面板额外显示 */}
        <StatCard title={t('todayPnlPercent')}
                  className="hidden 3xl:block" />
        <StatCard title={t('recentTrades')}
                  className="hidden 3xl:block" />
      </div>

      {/* === 主内容区 === */}
      <div className="
        grid gap-6
        grid-cols-1                   /* 📱 手机: 单列 */
        lg:grid-cols-3                /* 💻 桌面: 3列 */
        3xl:grid-cols-4               /* 🖥️ 大面板: 4列 */
      ">
        {/* 权益曲线 */}
        <div className="lg:col-span-2 3xl:col-span-3">
          <EquityCurveChart />
        </div>

        {/* 资产配置 */}
        <div className="lg:col-span-1 3xl:col-span-1">
          <AssetAllocationPie />
        </div>

        {/* 持仓列表 */}
        <div className="lg:col-span-2 3xl:col-span-2">
          <PositionTable />
        </div>

        {/* 运行中策略 */}
        <div className="lg:col-span-1 3xl:col-span-1">
          <ActiveStrategies />
        </div>

        {/* 快讯 (仅大面板显示) */}
        <div className="hidden 3xl:block 3xl:col-span-1">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
6. 交易面板响应式
TSX
// 交易终端 — 多设备自适应布局
export function TradingTerminal() {
  return (
    <div className="h-[calc(100vh-4rem)]">

      {/* 📱 手机: 标签页切换 */}
      <div className="md:hidden">
        <Tabs defaultValue="chart">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="chart">K线</TabsTrigger>
            <TabsTrigger value="orderbook">盘口</TabsTrigger>
            <TabsTrigger value="trade">交易</TabsTrigger>
            <TabsTrigger value="positions">持仓</TabsTrigger>
          </TabsList>
          <TabsContent value="chart"><ChartPanel /></TabsContent>
          <TabsContent value="orderbook"><OrderBook /></TabsContent>
          <TabsContent value="trade"><TradeForm /></TabsContent>
          <TabsContent value="positions"><PositionList /></TabsContent>
        </Tabs>
      </div>

      {/* 💻 桌面: 经典三栏布局 */}
      <div className="hidden md:grid 3xl:hidden
                      md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_280px_320px]
                      h-full gap-0">
        <div className="border-r"><ChartPanel /></div>
        <div className="border-r hidden lg:block"><OrderBook /></div>
        <div>
          <TradeForm />
          <PositionList />
        </div>
      </div>

      {/* 🖥️ 大面板: 四栏全展开 */}
      <div className="hidden 3xl:grid
                      3xl:grid-cols-[280px_1fr_300px_360px]
                      h-full gap-0">
        <div className="border-r"><MarketList /></div>
        <div className="border-r"><ChartPanel /></div>
        <div className="border-r"><OrderBook /></div>
        <div>
          <TradeForm />
          <PositionList />
          <RecentTrades />
        </div>
      </div>

    </div>
  );
}
7. 自定义 Hooks
TSX
// hooks/useMediaQuery.ts
"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// 预置常用断点
export function useDevice() {
  const isMobile   = useMediaQuery('(max-width: 767px)');
  const isTablet   = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop  = useMediaQuery('(min-width: 1024px) and (max-width: 1919px)');
  const isPanel    = useMediaQuery('(min-width: 1920px)');
  const isUltrawide= useMediaQuery('(min-width: 2560px)');
  const isTouch    = useMediaQuery('(pointer: coarse)');
  const isLandscape= useMediaQuery('(orientation: landscape)');

  return {
    isMobile, isTablet, isDesktop, isPanel, isUltrawide,
    isTouch, isLandscape,
    // 组合判断
    isMobileOrTablet: isMobile || isTablet,
    isDesktopOrAbove: isDesktop || isPanel || isUltrawide,
  };
}
四、RTL (从右到左) 支持
TSX
// 阿拉伯语等 RTL 语言自动处理

// 1. HTML dir 属性已在 layout.tsx 中根据 locale 设置
// 2. TailwindCSS 4 RTL 工具类:
<div className="mr-4 rtl:ml-4 rtl:mr-0">  {/* 手动翻转 */}</div>
<div className="ms-4">   {/* margin-inline-start: 自动适配 RTL */}</div>
<div className="ps-4">   {/* padding-inline-start */}</div>
<div className="text-start"> {/* 自动适配文本对齐 */}</div>

// 3. 侧边栏位置翻转
<aside className="
  border-r border-border
  rtl:border-r-0 rtl:border-l   /* RTL: 侧边栏在右侧 */
">
五、Header 全局工具栏
TSX
// components/layout/Header.tsx — 集成语言+主题+响应式
"use client";

import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { CommandSearch } from './CommandSearch';
import { useDevice } from '@/hooks/useMediaQuery';

export function Header() {
  const { isMobile } = useDevice();

  return (
    <header className="
      sticky top-0 z-40
      h-14 border-b border-border
      bg-card/95 backdrop-blur
      flex items-center justify-between
      px-4 md:px-6
    ">
      {/* 左: Logo / 搜索 */}
      <div className="flex items-center gap-4">
        {!isMobile && <CommandSearch />}
      </div>

      {/* 右: 工具栏 */}
      <div className="flex items-center gap-1">
        <LocaleSwitcher />        {/* 🌐 语言切换 */}
        <ThemeSwitcher />         {/* 🌙 主题切换 */}
        <NotificationBell />      {/* 🔔 通知 */}
        <UserMenu />              {/* 👤 用户菜单 */}
      </div>
    </header>
  );
}
六、更新后的技术栈增补项
新增技术	用途
next-intl	App Router 国际化 (10 语言)
next-themes	主题切换 (dark/light/system)
CSS Variables (HSL)	语义化颜色 + 金融专属色 (涨跌/盈亏)
TailwindCSS 4 自定义断点	3xl (1920px) / 4xl (2560px) 大面板
@capacitor/core	移动端 App 封装
safe-area-inset	iOS 全面屏适配
useMediaQuery Hook	设备检测 + 条件渲染
RTL 支持	阿拉伯语等从右到左语言
ICU MessageFormat	复数/性别等复杂翻译模式
七、各模块国际化覆盖清单
Code
┌────────────────────────────────┬──────────────────────────────┐
│ 国际化维度                      │ 处理方式                      │
├────────────────────────────────┼──────────────────────────────┤
│ UI 文案 (按钮/标签/提示)        │ next-intl + JSON 翻译文件     │
│ 表单校验错误消息                │ Zod + 自定义 i18n errorMap    │
│ 后端 API 错误消息              │ 后端返回 error code → 前端翻译 │
│ 日期时间格式                    │ Intl.DateTimeFormat          │
│ 数字/货币格式                   │ Intl.NumberFormat            │
│ 大数缩写 (万/亿 vs K/M)       │ 自定义 useFinanceFormatter   │
│ 涨跌颜色 (中国红涨 vs 国际绿涨) │ CSS Variables + [lang] 选择器│
│ AI 分析结果                    │ LLM prompt 指定输出语言       │
│ 邮件/通知模板                   │ 后端模板引擎 + locale 参数    │
│ 图表标签/Tooltip               │ ECharts formatter + t()      │
│ SEO (title/description/OG)    │ next-intl + generateMetadata │
│ URL 路由                       │ /zh/dashboard → /en/dashboard│
│ 文本方向 (LTR/RTL)            │ html dir 属性 + Tailwind RTL │
└────────────────────────────────┴──────────────────────────────┘
以上方案完整覆盖了多语言切换、三种主题模式、四类设备适配。如果你准备好了，可以告诉我优先实现哪个模块，我来创建 PR。

Uploaded image: 个人中心-1.png
Uploaded image: 仪表盘-1.png
Uploaded image: 指标分析-1.png
Uploaded image: 资产分析-1.png
You said: 请参照quantdinger的UI部分截图设计好看的界面。
请参照quantdinger的UI部分截图设计好看的界面。
Copilot said: 根据 QuantDinger 的 4 张 UI 截图，我来详细分析其设计语言并给出我们
根据 QuantDinger 的 4 张 UI 截图，我来详细分析其设计语言并给出我们 React 19 + Next.js 15 + shadcn/ui 版本的增强设计方案。

UI 设计方案 — 参照 QuantDinger 风格增强版
一、QuantDinger 设计语言分析
Code
从 4 张截图提取的视觉设计规律:

┌─────────────────────────────────────────────────────────────────┐
│                    QuantDinger 设计语言                          │
├──────────────────┬──────────────────────────────────────────────┤
│ 主题色            │ 金黄色 (#F5A623) — Logo/侧边栏选中态          │
│ 布局             │ 左侧导航 (固定宽度) + 右侧内容区              │
│ 卡片风格          │ 白底圆角卡片 + 轻微阴影                      │
│ 渐变色            │ 紫色渐变卡 (积分) · 绿色渐变卡 (邀请)         │
│ 信息密度          │ 中高密度 — 仪表盘单屏展示 6 个统计卡片         │
│ 数据展示          │ 大数字 + 小标签 + 颜色区分 (涨绿/跌红)        │
│ 导航              │ 图标 + 文字, 选中态左侧橙色竖条               │
│ K线图             │ 专业级全屏K线 + 指标选择器 + 工具栏            │
│ AI 分析           │ 全球市场行情带 + 多市场标签页 + 自选列表        │
│ 个人中心          │ 头像卡片 + 标签页 (基本信息/密码/消费/通知...)  │
│ 页脚              │ 联系我们 + 社交链接 + 版权                    │
└──────────────────┴──────────────────────────────────────────────┘
二、我们的设计升级策略
Code
┌─────────────────────────────────────────────────────────────────┐
│          QuantDinger 现有                    我们的增强           │
├─────────────────────────────────┬───────────────────────────────┤
│ Ant Design Vue 组件库           │ shadcn/ui + Radix (更现代)    │
│ 单一亮色主题                    │ 暗色/亮色/自适应 三种主题      │
│ 固定金黄色主色                  │ 可自定义主题色 (品牌色系统)    │
│ 传统平面卡片                    │ 毛玻璃质感 + 微动效 卡片       │
│ 基础表格                        │ 虚拟滚动 + 列固定 + 筛选       │
│ 桌面端为主                      │ 四端响应式 (手机/平板/桌面/面板)│
│ KLineCharts                    │ TradingView LW Charts        │
│ 基础渐变色卡片                  │ 精致渐变 + 动态光效            │
│ 简单侧边栏                     │ 可折叠 + 搜索 + 快捷键         │
└─────────────────────────────────┴───────────────────────────────┘
三、全局设计系统
1. 颜色系统
CSS
/* globals.css — 参照 QuantDinger 金黄主色 + 现代化扩展 */

@layer base {
  :root {
    /* ===== 品牌色 (参照 QuantDinger 金黄色系) ===== */
    --brand:                36 100% 50%;       /* #F5A623 金黄 */
    --brand-foreground:     0 0% 100%;
    --brand-light:          42 100% 62%;       /* 浅金 */
    --brand-dark:           30 100% 42%;       /* 深金 */

    /* ===== 基础色 ===== */
    --background:           220 20% 97%;       /* 浅灰底 #F5F6FA */
    --foreground:           222 47% 11%;
    --card:                 0 0% 100%;
    --card-foreground:      222 47% 11%;
    --popover:              0 0% 100%;
    --popover-foreground:   222 47% 11%;
    --primary:              36 100% 50%;       /* 品牌金黄 */
    --primary-foreground:   0 0% 100%;
    --secondary:            220 14% 96%;
    --secondary-foreground: 220 9% 46%;
    --muted:                220 14% 96%;
    --muted-foreground:     220 9% 46%;
    --accent:               36 100% 96%;       /* 金黄高亮背景 */
    --accent-foreground:    36 100% 40%;
    --border:               220 13% 91%;
    --ring:                 36 100% 50%;
    --radius:               0.75rem;

    /* ===== 金融专属色 (国际标准) ===== */
    --profit:               160 84% 39%;       /* 盈利绿 #26a69a */
    --loss:                 4 90% 58%;          /* 亏损红 #ef5350 */
    --warning:              36 100% 50%;        /* 预警橙 */
    --info:                 211 100% 50%;       /* 信息蓝 #0080FF */

    /* ===== 渐变预设 (参照 QuantDinger 紫/绿卡片) ===== */
    --gradient-primary:     linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-success:     linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    --gradient-info:        linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
    --gradient-warning:     linear-gradient(135deg, #f5a623 0%, #f7d794 100%);
    --gradient-danger:      linear-gradient(135deg, #eb3349 0%, #f45c43 100%);

    /* ===== 图表色 ===== */
    --candle-up:            160 84% 39%;
    --candle-down:          4 90% 58%;
    --chart-grid:           220 13% 93%;
    --chart-tooltip-bg:     0 0% 100%;
  }

  .dark {
    --background:           222 47% 5%;        /* 深黑底 #0d1117 */
    --foreground:           210 40% 92%;
    --card:                 222 47% 8%;        /* 卡片深色 #161b22 */
    --card-foreground:      210 40% 92%;
    --primary:              36 100% 55%;
    --primary-foreground:   222 47% 5%;
    --secondary:            217 33% 14%;
    --secondary-foreground: 210 40% 72%;
    --muted:                217 33% 14%;
    --muted-foreground:     215 20% 55%;
    --accent:               36 100% 12%;
    --accent-foreground:    36 100% 60%;
    --border:               217 33% 17%;

    --profit:               160 84% 45%;
    --loss:                 4 90% 60%;

    --gradient-primary:     linear-gradient(135deg, #4a5aa8 0%, #5a3a8a 100%);
    --gradient-success:     linear-gradient(135deg, #0d7d6a 0%, #1fb85e 100%);

    --chart-grid:           217 33% 17%;
    --chart-tooltip-bg:     222 47% 12%;
  }

  /* 中国用户: 涨红跌绿 */
  [lang="zh"]      { --candle-up: 4 90% 58%;  --candle-down: 160 84% 39%; }
  [lang="zh"].dark { --candle-up: 4 90% 62%;  --candle-down: 160 84% 48%; }
}
2. 通用卡片组件
TSX
// components/ui/gradient-card.tsx
// 参照 QuantDinger 截图1 中的紫色积分卡 + 绿色邀请卡

import { cn } from '@/lib/utils';

type GradientVariant = 'primary' | 'success' | 'info' | 'warning' | 'danger';

const gradientMap: Record<GradientVariant, string> = {
  primary: 'from-indigo-500 via-purple-500 to-purple-700',  // 紫色渐变 (积分卡)
  success: 'from-emerald-400 via-green-500 to-teal-600',    // 绿色渐变 (邀请卡)
  info:    'from-blue-400 via-cyan-500 to-blue-600',         // 蓝色渐变 (总权益)
  warning: 'from-amber-400 via-orange-400 to-yellow-500',    // 金色渐变
  danger:  'from-red-500 via-rose-500 to-pink-600',          // 红色渐变
};

export function GradientCard({
  variant = 'primary',
  className,
  children,
}: {
  variant?: GradientVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl p-6 text-white',
      'bg-gradient-to-br shadow-lg',
      gradientMap[variant],
      // 装饰光圈
      'before:absolute before:top-[-50%] before:right-[-20%]',
      'before:h-[200%] before:w-[60%] before:rounded-full',
      'before:bg-white/10 before:blur-3xl',
      className,
    )}>
      {children}
    </div>
  );
}
四、核心页面实现
页面 1: 仪表盘 (Dashboard) — 参照截图 2
TSX
// app/[locale]/(dashboard)/page.tsx

import { getTranslations } from 'next-intl/server';
import { GradientCard } from '@/components/ui/gradient-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp, Trophy, BarChart3, TrendingDown,
  Repeat, Rocket, ChevronRight, Calendar,
} from 'lucide-react';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ===== 页面标题 ===== */}
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
      </div>

      {/* ===== 统计卡片行 (参照截图2: 总权益/胜率/盈亏比/最大回撤/总交易/运行中策略) ===== */}
      <div className="
        grid gap-4
        grid-cols-2 md:grid-cols-3 lg:grid-cols-6
      ">
        {/* 总权益 — 渐变蓝卡 (参照截图2第一个蓝色卡片) */}
        <GradientCard variant="info" className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-white/20 p-1.5">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-white/90">
              {t('totalEquity')}
            </span>
          </div>
          <p className="text-3xl font-bold">$12,345.67</p>
          <p className="text-sm text-white/70 mt-1">
            <span className="text-emerald-300">+2.34%</span> {t('totalPnl')}
          </p>
        </GradientCard>

        {/* 胜率 */}
        <StatCard
          icon={Trophy}
          label={t('winRate')}
          value="68.5"
          unit="%"
          sub="42胜 / 19负"
          iconColor="text-amber-500"
        />

        {/* 盈亏比 */}
        <StatCard
          icon={BarChart3}
          label={t('profitLossRatio')}
          value="2.31"
          unit=":1"
          sub={`${t('avgProfit')} $156.20`}
          iconColor="text-violet-500"
        />

        {/* 最大回撤 */}
        <StatCard
          icon={TrendingDown}
          label={t('maxDrawdown')}
          value="8.7"
          unit="%"
          sub="$1,075.00"
          iconColor="text-rose-500"
        />

        {/* 总交易 */}
        <StatCard
          icon={Repeat}
          label={t('totalTrades')}
          value="61"
          unit={t('count')}
          sub={`${t('dailyAvg')} 3.2 ${t('count')}`}
          iconColor="text-cyan-500"
        />

        {/* 运行中策略 — 可点击展开 */}
        <StatCard
          icon={Rocket}
          label={t('activeStrategies')}
          value="3"
          unit={t('count')}
          sub={`5 ${t('indicators')}`}
          iconColor="text-green-500"
          action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* ===== 第二行: 收益日历 + 策略分布 (参照截图2) ===== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* 收益日历 — 热力图 (ECharts) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-brand" />
              {t('profitCalendar')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground">‹</button>
              <span className="text-sm text-muted-foreground">2026-04</span>
              <button className="text-muted-foreground hover:text-foreground">›</button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ProfitCalendarHeatmap />
          </CardContent>
        </Card>

        {/* 策略分布 — 环形图 (ECharts) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-brand" />
              {t('strategyDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <StrategyDistributionDonut />
          </CardContent>
        </Card>
      </div>

      {/* ===== 第三行: 回撤曲线 + 交易时段 (参照截图2底部) ===== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-brand" />
              {t('drawdownCurve')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <DrawdownChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              ⏱ {t('tradingSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <TradingSessionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ===== 统计卡片子组件 ===== */
function StatCard({
  icon: Icon, label, value, unit, sub, iconColor, action,
}: {
  icon: any; label: string; value: string; unit: string;
  sub: string; iconColor: string; action?: React.ReactNode;
}) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg bg-muted p-1.5", iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          {action}
        </div>
        <p className="text-2xl font-bold">
          {value}
          <span className="text-base text-muted-foreground ml-1">{unit}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
页面 2: 指标分析 (Indicator IDE) — 参照截图 3
TSX
// app/[locale]/(dashboard)/analysis/page.tsx

"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Plus, ShoppingBag, Info, Play, Eye } from 'lucide-react';

export default function AnalysisPage() {
  const t = useTranslations('analysis');
  const [timeframe, setTimeframe] = useState('1D');
  const [symbol] = useState('ETH/USDT');

  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];
  const indicators = ['SMA', 'EMA', 'RSI', 'MACD', 'BB', 'ATR',
                       'CCI', 'W%R', 'MFI', 'ADX', 'OBV', 'ADOSC', 'AD', 'KDJ'];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">

      {/* ===== 顶部工具栏 (参照截图3) ===== */}
      <div className="
        flex items-center justify-between
        border-b border-border px-4 py-2
        flex-wrap gap-2
      ">
        {/* 左: 市场类型 + 交易对 + 时间周期 */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="
            border-brand text-brand bg-brand/5
            font-medium px-3 py-1
          ">
            {t('crypto')}
          </Badge>

          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">{symbol}</span>
            <span className="text-muted-foreground text-sm">Ethereum</span>
          </div>

          {/* 时间周期按钮组 */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md transition-colors',
                  timeframe === tf
                    ? 'bg-brand text-white font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 右: 当前价格 + 快速交易按钮 */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-bold text-lg">ETH/USDT</span>
            <span className="text-xs text-muted-foreground ml-1">Crypto</span>
            <div>
              <span className="text-xl font-bold">2,185.79</span>
              <span className="text-sm text-loss ml-2">-0.20%</span>
            </div>
          </div>
          <Button className="bg-brand hover:bg-brand-dark text-white gap-1">
            <Zap className="h-4 w-4" />
            {t('quickTrade')}
          </Button>
        </div>
      </div>

      {/* ===== 主内容: K线图 + 右侧指标面板 ===== */}
      <div className="flex-1 flex overflow-hidden">

        {/* 📱 手机: 全屏K线 (指标面板通过 Sheet 打开) */}
        {/* 💻 桌面: K线 + 右侧指标面板 (参照截图3) */}
        <div className="flex-1 flex flex-col relative">

          {/* 技术指标选择器 (参照截图3: SMA/EMA/RSI/MACD...) */}
          <div className="
            flex items-center gap-1.5 px-4 py-2
            border-b border-border overflow-x-auto
            scrollbar-none
          ">
            {indicators.map((ind) => (
              <Button key={ind} variant="outline" size="sm"
                className="rounded-full text-xs h-7 px-3 shrink-0
                           hover:border-brand hover:text-brand">
                {ind}
              </Button>
            ))}
          </div>

          {/* OHLCV 信息条 (参照截图3) */}
          <div className="
            flex items-center gap-4 px-4 py-1.5
            text-xs text-muted-foreground
            border-b border-border
          ">
            <span>Time: 2026-04-10 08:00</span>
            <span>Open: <b className="text-foreground">2,190.15</b></span>
            <span>High: <b className="text-foreground">2,204.63</b></span>
            <span>Low: <b className="text-foreground">2,176.08</b></span>
            <span>Close: <b className="text-foreground">2,185.79</b></span>
            <span>Volume: <b className="text-foreground">19.414K</b></span>
          </div>

          {/* K线图 (TradingView Lightweight Charts) */}
          <div className="flex-1">
            <TradingViewChart symbol={symbol} timeframe={timeframe} />
          </div>
        </div>

        {/* ===== 右侧: 技术指标面板 (参照截图3右侧) ===== */}
        <aside className="
          hidden lg:flex flex-col
          w-[320px] border-l border-border
          bg-card overflow-y-auto
        ">
          {/* 标题 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{t('technicalIndicators')}</h3>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* 我创建的指标 */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('myIndicators')} (3)
              </h4>
              <Button size="sm" variant="destructive"
                      className="bg-brand hover:bg-brand-dark h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                {t('createIndicator')}
              </Button>
            </div>

            {/* 指标卡片列表 */}
            <div className="space-y-2">
              <IndicatorCard
                name="Dual MA Crossover"
                desc="SMA 14/28 金叉做多, 死叉做空"
                hasBacktest
              />
              <IndicatorCard
                name="RSI Divergence"
                desc="RSI 超卖反转 + 价格背离检测"
                hasBacktest
              />
            </div>
          </div>

          {/* 我购买的指标 (参照截图3) */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('purchasedIndicators')} (2)
              </h4>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-brand">
                <ShoppingBag className="h-3 w-3" />
                {t('indicatorMarket')}
              </Button>
            </div>

            <div className="space-y-2">
              <IndicatorCard
                name="ADX + DI Crossover"
                desc="Buy when +DI crosses above -DI with ADX > 25"
                purchased
              />
              <IndicatorCard
                name="Golden Cross Strategy"
                desc="50 SMA crosses above 200 SMA, sell on death cross"
                purchased
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===== 指标卡片子组件 ===== */
function IndicatorCard({
  name, desc, hasBacktest, purchased,
}: {
  name: string; desc: string;
  hasBacktest?: boolean; purchased?: boolean;
}) {
  return (
    <div className="
      rounded-lg border border-border p-3
      hover:border-brand/50 hover:shadow-sm
      transition-all cursor-pointer group
    ">
      <div className="flex items-start justify-between">
        <h5 className="text-sm font-medium group-hover:text-brand transition-colors">
          {name}
        </h5>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-muted" title="Preview">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {hasBacktest && (
            <button className="p-1 rounded hover:bg-muted" title="Backtest">
              <Play className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
    </div>
  );
}
页面 3: AI 资产分析 — 参照截图 4
TSX
// app/[locale]/(dashboard)/analysis/ai/page.tsx

"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GradientCard } from '@/components/ui/gradient-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Radar, Zap, Clock, Globe, Star, Plus, History,
  TrendingUp, TrendingDown, Calendar as CalendarIcon,
} from 'lucide-react';

export default function AIAnalysisPage() {
  const t = useTranslations('ai');

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ===== AI 交易机会雷达 (参照截图4顶部横向卡片滚动) ===== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="h-5 w-5 text-brand" />
            {t('opportunityRadar')}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {t('hourlyUpdate')}
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              🔄 {t('refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 横向滚动卡片 (参照截图4: NIO/INTC/COIN/CRM/NFLX/META/AMD...) */}
          <div className="
            flex gap-3 overflow-x-auto pb-2
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border
            snap-x snap-mandatory
          ">
            {[
              { symbol: 'NIO',   price: '$6.07',   change: '-4.9%', signal: 'bearish', market: 'US Stock' },
              { symbol: 'INTC',  price: '$61.72',  change: '+4.7%', signal: 'bearish', market: 'US Stock' },
              { symbol: 'COIN',  price: '$169.02', change: '-3.5%', signal: 'bearish', market: 'US Stock' },
              { symbol: 'CRM',   price: '$170.85', change: '-3.1%', signal: 'bearish', market: 'US Stock' },
              { symbol: 'NFLX',  price: '$102.05', change: '+2.7%', signal: 'bullish', market: 'US Stock' },
              { symbol: 'META',  price: '$628.39', change: '+2.6%', signal: 'bullish', market: 'US Stock' },
              { symbol: 'AMD',   price: '$236.64', change: '+2.1%', signal: 'bullish', market: 'US Stock' },
              { symbol: 'PLTR',  price: '$130.49', change: '-7.3%', signal: 'bearish', market: 'US Stock' },
            ].map((item) => (
              <div key={item.symbol} className="
                min-w-[160px] snap-start
                rounded-xl border border-border p-4
                hover:border-brand/50 hover:shadow-md
                transition-all cursor-pointer group
                bg-card
              ">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg group-hover:text-brand">
                    {item.symbol}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {item.market}
                  </Badge>
                </div>
                <p className="text-base font-semibold">{item.price}</p>
                <p className={cn(
                  'text-sm font-medium',
                  item.change.startsWith('+') ? 'text-profit' : 'text-loss'
                )}>
                  {item.change}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={cn(
                    'text-[10px] h-5',
                    item.signal === 'bullish'
                      ? 'bg-profit/10 text-profit border-profit/30'
                      : 'bg-loss/10 text-loss border-loss/30'
                  )}>
                    {item.signal === 'bullish' ? '看涨' : '看跌'}
                  </Badge>
                  <button className="text-xs text-brand hover:underline flex items-center gap-0.5">
                    <Zap className="h-3 w-3" />
                    {t('analyze')}
                  </button>
                </div>
                {/* 摘要 (参照截图4) */}
                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                  日跌幅{item.change}，下跌趋势明显
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 全球市场行情带 (参照截图4: US/DE/GB/FR/JP/KR/AU 指数滚动条) ===== */}
      <div className="
        flex items-center gap-4 overflow-x-auto
        py-2 px-4 bg-muted/50 rounded-lg
        text-xs whitespace-nowrap
        scrollbar-none
      ">
        <span className="font-medium text-muted-foreground shrink-0">资本</span>
        <span className="shrink-0">VIX <b>19.49</b></span>
        <span className="shrink-0">DXY <b>98.92</b></span>
        <span className="text-border">│</span>
        {[
          { label: 'US ^DJI',    value: '48.2K', change: '+0.58%', up: true },
          { label: 'US ^IXIC',   value: '22.8K', change: '+0.83%', up: true },
          { label: 'DE ^GDAXI',  value: '23.8K', change: '-1.14%', up: false },
          { label: 'GB ^FTSE',   value: '10.6K', change: '+0.05%', up: true },
          { label: 'FR ^FCHI',   value: '8246',  change: '+0.22%', up: true },
          { label: 'JP ^N225',   value: '56.9K', change: '+1.84%', up: true },
          { label: 'KR ^KS11',   value: '5859',  change: '+1.40%', up: true },
          { label: 'AU ^AXJO',   value: '8961',  change: '-0.14%', up: false },
        ].map((idx) => (
          <span key={idx.label} className="shrink-0 flex items-center gap-1">
            {idx.label} <b>{idx.value}</b>
            <span className={idx.up ? 'text-profit' : 'text-loss'}>
              {idx.up ? '▲' : '▼'} {idx.change}
            </span>
          </span>
        ))}
      </div>

      {/* ===== 标签页: 即时分析 / 资产池 / 预测市场 (参照截图4) ===== */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis" className="gap-1">
            <Zap className="h-3.5 w-3.5" />
            {t('fastAnalysis')}
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="gap-1">
            <Star className="h-3.5 w-3.5" />
            {t('watchlist')}
          </TabsTrigger>
          <TabsTrigger value="prediction" className="gap-1">
            <Globe className="h-3.5 w-3.5" />
            {t('predictionMarket')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[360px_1fr_280px]">

            {/* 左: 市场标签 + 资产网格 + 财经日历 (参照截图4左侧) */}
            <div className="space-y-4">
              {/* 市场切换标签 */}
              <div className="flex gap-1">
                {['加密货币', '大宗商品', '板块', '外汇'].map((tab, i) => (
                  <Button key={tab} size="sm" variant={i === 0 ? 'default' : 'ghost'}
                    className={i === 0
                      ? 'bg-brand text-white hover:bg-brand-dark h-7 text-xs'
                      : 'h-7 text-xs'
                    }>
                    {tab}
                  </Button>
                ))}
              </div>

              {/* 资产价格网格 (参照截图4: BTC/ETH/USDT 3x4 网格) */}
              <Card>
                <CardContent className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { symbol: 'BTC', price: '$71.8K', change: '+1.23%' },
                      { symbol: 'ETH', price: '$2185',  change: '+0.19%' },
                      { symbol: 'USDT', price: '$1.00', change: '+0.00%' },
                      { symbol: 'XRP', price: '$1.34',  change: '+0.62%' },
                      { symbol: 'BNB', price: '$600.36',change: '+0.02%' },
                      { symbol: 'USDC', price: '$0.9999',change: '+0.00%' },
                      { symbol: 'SOL', price: '$83.18', change: '+1.21%' },
                      { symbol: 'TRX', price: '$0.3194',change: '+0.65%' },
                      { symbol: 'FIQR', price: '$1.03', change: '+0.15%' },
                    ].map((coin) => (
                      <div key={coin.symbol} className="
                        text-center p-2 rounded-lg
                        hover:bg-muted cursor-pointer transition-colors
                      ">
                        <p className="font-semibold text-sm">{coin.symbol}</p>
                        <p className="text-xs text-muted-foreground">{coin.price}</p>
                        <p className={cn(
                          'text-xs font-medium',
                          coin.change.startsWith('+') ? 'text-profit' : 'text-loss'
                        )}>
                          {coin.change}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 财经日历 (参照截图4左下) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-brand" />
                    {t('economicCalendar')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2 text-xs">
                    {[
                      { date: '4/5',  time: '08:30', region: 'US', event: '美国非农就业数据', impact: '↓ 170K' },
                      { date: '4/6',  time: '11:30', region: 'US', event: '美联储利率决议',   impact: '↑ 5.49%' },
                      { date: '4/7',  time: '14:30', region: 'US', event: '美国CPI月率',     impact: '↓ 0.32%' },
                      { date: '4/8',  time: '17:30', region: 'EU', event: '欧洲央行利率决议', impact: '↑ 4.10%' },
                    ].map((evt, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0">
                        <span className="text-muted-foreground w-8">{evt.date}</span>
                        <span className="text-muted-foreground w-10">{evt.time}</span>
                        <Badge variant="outline" className="text-[10px] h-4 w-6 justify-center">
                          {evt.region}
                        </Badge>
                        <span className="flex-1 truncate">{evt.event}</span>
                        <span className={cn(
                          'font-medium',
                          evt.impact.startsWith('↑') ? 'text-profit' : 'text-loss'
                        )}>
                          {evt.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 中: AI 分析区域 (参照截图4中间) */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder={t('selectAsset')}
                    className="flex-1"
                  />
                  <Button className="bg-brand hover:bg-brand-dark text-white gap-1">
                    <Zap className="h-4 w-4" />
                    {t('startAnalysis')}
                  </Button>
                  <Button variant="outline" className="gap-1">
                    <History className="h-4 w-4" />
                    {t('history')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg font-medium">{t('selectAndAnalyze')}</p>
                  <p className="text-sm mt-1">{t('selectFromWatchlist')}</p>
                </div>
              </CardContent>
            </Card>

            {/* 右: 自选列表 (参照截图4右侧) */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-brand fill-brand" />
                    {t('myWatchlist')}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[
                    { symbol: 'ETH/USDT', name: 'Ethereum', price: '2185', change: '+0.00%' },
                    { symbol: 'BTC/USDT', name: 'Bitcoin',  price: '71.8K', change: '+0.00%' },
                  ].map((item) => (
                    <div key={item.symbol} className="
                      flex items-center justify-between px-4 py-3
                      hover:bg-muted cursor-pointer transition-colors
                    ">
                      <div>
                        <p className="font-medium text-sm">{item.symbol}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.price}</p>
                        <p className="text-xs text-profit">{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
页面 4: 个人中心 — 参照截图 1
TSX
// app/[locale]/(dashboard)/profile/page.tsx

import { getTranslations } from 'next-intl/server';
import { GradientCard } from '@/components/ui/gradient-card';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Mail, Calendar, Copy, Gift,
  Shield, CreditCard, Bell, Key, Users,
} from 'lucide-react';

export default async function ProfilePage() {
  const t = await getTranslations('profile');

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ===== 页面标题 ===== */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-brand" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('subtitle')}</p>
      </div>

      {/* ===== 三卡片横排 (参照截图1: 用户信息 + 积分 + 邀请) ===== */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">

        {/* 用户信息卡片 (参照截图1左侧白色卡片) */}
        <Card className="md:row-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 ring-4 ring-brand/20">
              <AvatarImage src="/avatars/user.png" />
              <AvatarFallback className="text-2xl bg-brand/10 text-brand">JL</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">John Lou</h3>
            <Badge className="mt-2 bg-brand/10 text-brand border-brand/30">
              {t('normalUser')}
            </Badge>

            <div className="w-full mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{t('username')}:</span>
                <span className="font-medium">JohnLou</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{t('email')}:</span>
                <span className="font-medium">john.lou@qq.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{t('lastLogin')}:</span>
                <span className="font-medium">2026/4/8 11:24:34</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 积分卡片 — 紫色渐变 (参照截图1中间紫色卡片) */}
        <GradientCard variant="primary" className="flex flex-col justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white/90">
              <CreditCard className="h-5 w-5" />
              {t('myCredits')}
            </h3>
          </div>

          <div className="text-center my-6">
            <span className="text-6xl font-bold">100</span>
            <span className="text-xl ml-2 text-white/80">{t('credits')}</span>
            <p className="text-white/60 mt-2">{t('nonVipUser')}</p>
          </div>

          <div className="space-y-3">
            <div className="border-t border-white/20 pt-3">
              <Button variant="outline"
                className="w-full bg-white/15 border-white/30 text-white
                           hover:bg-white/25 gap-2">
                <Shield className="h-4 w-4" />
                {t('upgradeOrRecharge')}
              </Button>
            </div>
            <p className="text-[11px] text-white/50 text-center flex items-center gap-1 justify-center">
              ℹ {t('creditsNote')}
            </p>
          </div>
        </GradientCard>

        {/* 邀请好友卡片 — 绿色渐变 (参照截图1右侧绿色卡片) */}
        <GradientCard variant="success" className="flex flex-col justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white/90">
            <Users className="h-5 w-5" />
            {t('inviteFriends')}
          </h3>

          <div className="flex items-center justify-around my-4">
            <div className="text-center">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-white/70">{t('invited')}</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">+50</p>
              <p className="text-sm text-white/70">{t('perInviteReward')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-white/80 text-center">{t('yourInviteLink')}</p>
            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
              <input
                readOnly
                value="https://ai.quantdinger.com/#/user/login?ref=839"
                className="flex-1 bg-transparent text-white text-xs outline-none"
              />
              <button className="shrink-0 p-1 rounded hover:bg-white/20">
                <Copy className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-white/50 text-center flex items-center gap-1 justify-center">
              <Gift className="h-3 w-3" />
              {t('registerBonus')}
            </p>
          </div>
        </GradientCard>
      </div>

      {/* ===== 标签页区域 (参照截图1下半部分) ===== */}
      <Card>
        <Tabs defaultValue="basic" className="w-full">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-12 gap-0">
              {[
                { key: 'basic',         icon: User,       label: t('basicInfo') },
                { key: 'password',      icon: Shield,     label: t('changePassword') },
                { key: 'billing',       icon: CreditCard, label: t('consumeHistory') },
                { key: 'notifications', icon: Bell,       label: t('notificationSettings') },
                { key: 'credentials',   icon: Key,        label: t('exchangeConfig') },
                { key: 'referrals',     icon: Users,      label: t('referralList') },
              ].map(({ key, icon: Icon, label }) => (
                <TabsTrigger key={key} value={key} className="
                  relative h-12 rounded-none border-b-2 border-transparent
                  data-[state=active]:border-brand
                  data-[state=active]:text-brand
                  data-[state=active]:shadow-none
                  gap-1.5
                ">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="basic" className="p-6 space-y-6">
            <div className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label>{t('nickname')}</Label>
                <Input defaultValue="John Lou" className="max-w-md" />
              </div>
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input defaultValue="john.lou@qq.com" className="max-w-md" disabled />
                <p className="text-xs text-muted-foreground">
                  ℹ {t('emailChangeNote')}
                </p>
              </div>
              <Button className="bg-brand hover:bg-brand-dark text-white gap-1">
                💾 {t('save')}
              </Button>
            </div>
          </TabsContent>

          {/* 其他 TabsContent 省略... */}
        </Tabs>
      </Card>
    </div>
  );
}
五、全局侧边栏 (参照截图 1-4 左侧)
TSX
// components/layout/AppSidebar.tsx
// 参照 QuantDinger: Logo + 导航项 + 选中橙色竖条 + 底部联系信息

"use client";

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Brain, TrendingUp, Store,
  Bot, User, CreditCard,
} from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export function AppSidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { key: 'dashboard',  icon: LayoutDashboard, href: '/',            label: t('dashboard') },
    { key: 'ai',         icon: Brain,           href: '/analysis/ai', label: t('aiAnalysis') },
    { key: 'indicator',  icon: TrendingUp,      href: '/analysis',    label: t('indicator') },
    { key: 'market',     icon: Store,           href: '/markets',     label: t('indicatorMarket') },
    { key: 'trading',    icon: Bot,             href: '/trading',     label: t('tradingBot') },
    { key: 'profile',    icon: User,            href: '/profile',     label: t('profile') },
    { key: 'billing',    icon: CreditCard,      href: '/billing',     label: t('membership') },
  ];

  return (
    <aside className="
      hidden md:flex flex-col
      w-[200px] h-screen sticky top-0
      border-r border-border bg-card
      shrink-0
    ">
      {/* Logo (参照 QuantDinger 金色 Logo) */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
          <span className="text-white font-bold text-sm">Q</span>
        </div>
        <span className="font-bold text-brand text-lg">QuantDinger</span>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ key, icon: Icon, href, label }) => {
          const isActive = pathname === href ||
            (href !== '/' && pathname.startsWith(href));
          return (
            <a key={key} href={href} className={cn(
              'relative flex items-center gap-3',
              'rounded-lg px-3 py-2.5 text-sm',
              'transition-colors group',
              isActive
                ? 'text-brand font-medium bg-brand/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}>
              {/* 选中态左侧橙色竖条 (参照截图) */}
              {isActive && (
                <div className="
                  absolute left-0 top-1/2 -translate-y-1/2
                  w-[3px] h-6 rounded-r-full bg-brand
                " />
              )}
              <Icon className={cn('h-4 w-4 shrink-0',
                isActive ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {/* 底部: 联系我们 + 社交链接 (参照截图) */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="text-center text-xs text-muted-foreground">
          <p className="font-medium">{t('contactUs')}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <a href="#" className="hover:text-foreground">Support</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground">Feature request</a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          {/* 社交图标 */}
          {['github', 'twitter', 'discord', 'telegram', 'youtube'].map((s) => (
            <a key={s} href="#" className="hover:text-foreground transition-colors">
              <span className="text-sm">●</span>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          © 2025-2026 QuantDinger. All rights reserved.
          <br />V3.0.1
        </p>
      </div>
    </aside>
  );
}
六、全局 Header (参照截图 1-4 顶部)
TSX
// components/layout/Header.tsx
// 参照 QuantDinger: Logo区域 | 工具按钮 | 用户名 | 通知 | 语言 | 设置

"use client";

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  Bell, Settings, AlignJustify, RefreshCw, Menu,
} from 'lucide-react';
import { useDevice } from '@/hooks/useMediaQuery';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { isMobile } = useDevice();

  return (
    <header className="
      sticky top-0 z-40
      h-14 border-b border-border
      bg-card/95 backdrop-blur-sm
      flex items-center justify-between
      px-4
    ">
      {/* 左: 折叠按钮 + 刷新 (参照截图顶部左侧图标) */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              {/* 移动端侧边栏内容 */}
            </SheetContent>
          </Sheet>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 右: 用户名 + 通知 + 语言 + 主题 + 设置 (参照截图顶部右侧) */}
      <div className="flex items-center gap-1">
        {/* 用户头像 + 名字 */}
        <div className="flex items-center gap-2 mr-2">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="text-sm font-medium hidden sm:inline">John Lou</span>
        </div>

        {/* 通知铃铛 */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* 语言切换 */}
        <LocaleSwitcher />

        {/* 主题切换 */}
        <ThemeSwitcher />

        {/* 设置 */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
七、全局布局整合
TSX
// app/[locale]/(dashboard)/layout.tsx
// 侧边栏 + Header + 内容区 + 手机底部Tab

import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { MobileTabBar } from '@/components/layout/MobileTabBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 侧边导航 (平板及以上显示) */}
      <AppSidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* 可滚动内容区 */}
        <main className="
          flex-1 overflow-y-auto
          pb-20 md:pb-0              /* 手机底部留出 Tab 栏空间 */
        ">
          {children}
        </main>
      </div>

      {/* 手机底部标签栏 */}
      <MobileTabBar />
    </div>
  );
}
八、设计规范总结
Code
┌─────────────────────────────────────────────────────────────────────────┐
│                       设计规范速查                                       │
├─────────────────────┬───────────────────────────────────────────────────┤
│ 品牌主色             │ #F5A623 (金黄) — 参照 QuantDinger                 │
│ 圆角                │ 0.75rem (12px) — 卡片、按钮、输入框                │
│ 卡片阴影 (亮色)      │ shadow-sm → hover:shadow-md                      │
│ 卡片阴影 (暗色)      │ 无阴影 → 边框分隔                                 │
│ 选中态标识           │ 左侧 3px 圆角竖条 (品牌色)                        │
│ 渐变卡片             │ 紫色=积分/会员  绿色=邀请/社交  蓝色=总权益/资产   │
│ 盈亏色 (国际)        │ 绿涨 #26a69a / 红跌 #ef5350                      │
│ 盈亏色 (中国)        │ 红涨 #ef5350 / 绿跌 #26a69a (CSS [lang=zh])     │
│ 字体大小             │ 统计大数: 2xl-3xl / 标签: xs-sm / 正文: sm        │
│ 间距                │ 页面: p-4 md:p-6 / 卡片间: gap-4~6 / 内: p-4~6   │
│ 响应式断点           │ <768 手机 / 768~1024 平板 / 1024~1920 桌面 / 1920+ 面板 │
│ 动效                │ transition-colors / transition-shadow / 200ms    │
│ 空状态              │ 居中图标 + 文案 + 引导操作 (参照截图4 🤖)          │
└─────────────────────┴───────────────────────────────────────────────────┘
以上就是参照 QuantDinger 4 张 UI 截图，用 React 19 + Next.js 15 + shadcn/ui + TailwindCSS 4 重新设计的完整界面方案。每个页面都保留了 QuantDinger 的核心布局思路（金黄主色、渐变卡片、侧边导航、专业 K 线图），同时在暗色主题、响应式、动效、组件化方面做了全面升级。

想要我针对某个具体页面创建 PR 开始实现吗？

You said: 量化交易除了支持加密货币，还需要支持美股，A股，H股，期货，外汇。
量化交易除了支持加密货币，还需要支持美股，A股，H股，期货，外汇。
Copilot said: # 增补方案 — 全市场支持 (加密货币 + 美股
增补方案 — 全市场支持 (加密货币 + 美股 + A股 + H股 + 期货 + 外汇)
一、全市场架构总览
Code
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Multi-Market Trading Architecture                  │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  Crypto  │ │ US Stock│ │ A Stock │ │ H Stock │ │ Futures │ │  Forex  │ │
│  │ 加密货币  │ │  美股    │ │  A股    │ │  H股    │ │  期货    │ │  外汇   │ │
│  └────┬─────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ │
│       │            │           │           │           │           │       │
│  ┌────▼────────────▼───────────▼───────────▼───────────▼───────────▼────┐  │
│  │                   Unified Market Adapter Layer                       │  │
│  │              (统一市场适配器层 — Python + Go)                         │  │
│  └────┬────────────┬───────────┬───────────┬───────────┬───────────┬────┘  │
│       │            │           │           │           │           │       │
│  ┌────▼────┐  ┌────▼────┐ ┌───▼────┐ ┌────▼───┐ ┌────▼────┐ ┌───▼────┐  │
│  │  CCXT   │  │  IBKR   │ │Tushare │ │Futu API│ │  CTP    │ │  MT5   │  │
│  │Binance  │  │ TWS API │ │东方财富  │ │富途牛牛  │ │中金所    │ │OANDA  │  │
│  │OKX/Bybit│  │Alpaca   │ │同花顺   │ │老虎证券  │ │上期所    │ │FXCM   │  │
│  │Gate/HTX │  │Tradier  │ │Wind    │ │长桥证券  │ │大商所    │ │Saxo   │  │
│  └─────────┘  └─────────┘ └────────┘ └────────┘ └─────────┘ └────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
二、各市场详细对照
1. 市场特性矩阵
Code
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ 特性      │ 加密货币  │  美股     │  A股     │  H股     │  期货     │  外汇    │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 交易时间   │ 7×24h   │工作日     │工作日    │工作日     │工作日     │5×24h    │
│          │         │9:30-16:00│9:30-15:00│9:30-16:00│ 分日/夜盘 │周日-周五  │
│          │         │ (ET)     │ (CST)    │ (HKT)    │          │         │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 计价货币   │ USDT/BTC│ USD      │ CNY      │ HKD      │ CNY      │ 多币种   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 最小单位   │ 0.00001 │ 0.01股   │ 100股/手  │ 1股/手   │ 1手      │ 0.01手   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 涨跌停     │ 无      │ 无       │ ±10%/20% │ 无       │ ±5%~10%  │ 无       │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ T+N       │ T+0     │ T+0      │ T+1      │ T+0      │ T+0      │ T+0      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 做空      │ 合约/杠杆 │ 融券     │ 融券     │ 融券     │ 原生双向  │ 原生双向  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 杠杆      │ 1~125x  │ 1~4x    │ 1~2x    │ 1~4x    │ 5~20x    │ 50~500x  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 合约到期   │ 永续/季度│ 无      │ 无       │ 无       │ 月/季     │ 无       │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 手续费模式 │ Maker/  │ 佣金制   │ 佣金+印花│ 佣金制   │ 手续费/手 │ 点差     │
│          │ Taker   │          │ 税       │          │          │         │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
2. 交易所/券商/数据源
Code
┌─────────────────────────────────────────────────────────────────────────────┐
│                     各市场 — 数据源 + 交易通道                               │
├──────────┬─────────────────────────┬────────────────────────────────────────┤
│ 市场      │ 行情数据源               │ 交易通道                               │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ CCXT (统一接口)          │ Binance / OKX / Bybit / Bitget       │
│ 加密货币  │ CoinGecko (聚合)        │ Gate.io / KuCoin / Coinbase          │
│          │ CryptoCompare           │ Kraken / HTX / Deepcoin              │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ IBKR TWS API            │ IBKR (盈透证券) — 主力                 │
│  美股     │ Yahoo Finance (yfinance)│ Alpaca (零佣金 API)                   │
│          │ Finnhub / Polygon.io    │ Tradier                              │
│          │ Alpha Vantage           │                                      │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ Tushare Pro             │ 华宝智投 / 恒生电子 API                │
│  A股     │ AKShare (免费)          │ QMT (迅投) — 量化首选                  │
│          │ 东方财富 Choice          │ PTrade (恒生) — 机构                  │
│          │ Wind (万得) — 机构       │ CTP (期货兼容) — 可扩展               │
│          │ Twelve Data             │ 掘金量化 / 聚宽本地 SDK                │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ 富途 OpenAPI            │ 富途牛牛 (Futu OpenD)                 │
│  H股     │ 长桥 API               │ 长桥证券 (Longbridge)                 │
│          │ IBKR TWS API           │ 老虎证券 (Tiger Trade)                │
│          │ Yahoo Finance (HK)     │ IBKR 港股通道                        │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ CTP 行情接口            │ CTP (综合交易平台) — 主力              │
│  期货     │ Tushare Pro (期货)     │ 各期货公司柜台系统                     │
│          │ AKShare (期货数据)      │ 飞创 (FEMAS) — 高频                   │
│          │ Wind (万得)            │ 易盛 (esunny) — 外盘                  │
├──────────┼─────────────────────────┼────────────────────────────────────────┤
│          │ MT5 内置数据流          │ MetaTrader 5 — 主力                   │
│  外汇     │ OANDA v20 API         │ OANDA (安达)                          │
│          │ Twelve Data            │ FXCM                                  │
│          │ Forex Factory (日历)    │ Saxo Bank                             │
└──────────┴─────────────────────────┴────────────────────────────────────────┘
三、统一市场适配器层 (核心架构)
1. 抽象接口设计
Python
# services/market_adapter/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from decimal import Decimal
from datetime import datetime
from typing import Optional, AsyncGenerator

# ==================== 市场枚举 ====================

class MarketType(str, Enum):
    CRYPTO   = "crypto"       # 加密货币
    US_STOCK = "us_stock"     # 美股
    A_STOCK  = "a_stock"      # A股
    HK_STOCK = "hk_stock"     # H股/港股
    FUTURES  = "futures"      # 期货
    FOREX    = "forex"        # 外汇

class AssetClass(str, Enum):
    SPOT        = "spot"         # 现货
    MARGIN      = "margin"       # 融资融券/杠杆
    FUTURES     = "futures"      # 期货合约
    PERPETUAL   = "perpetual"    # 永续合约
    OPTIONS     = "options"      # 期权
    CFD         = "cfd"          # 差价合约

class OrderSide(str, Enum):
    BUY  = "buy"
    SELL = "sell"

class OrderType(str, Enum):
    MARKET     = "market"
    LIMIT      = "limit"
    STOP       = "stop"
    STOP_LIMIT = "stop_limit"
    TRAILING   = "trailing_stop"

# ==================== 统一数据结构 ====================

@dataclass
class UnifiedSymbol:
    """统一标的标识"""
    raw_symbol: str          # 原始代码: "AAPL", "600519.SH", "BTC/USDT"
    market: MarketType
    asset_class: AssetClass
    base: str                # 基础资产: AAPL, 600519, BTC
    quote: str               # 计价货币: USD, CNY, USDT
    exchange: str            # 交易所: NASDAQ, SSE, binance
    name: Optional[str] = None
    display_name: Optional[str] = None  # "苹果公司", "贵州茅台"

@dataclass
class UnifiedKline:
    """统一 K 线数据"""
    symbol: str
    market: MarketType
    timestamp: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    turnover: Optional[Decimal] = None     # 成交额
    open_interest: Optional[Decimal] = None # 持仓量 (期货)

@dataclass
class UnifiedTicker:
    """统一实时行情"""
    symbol: str
    market: MarketType
    last_price: Decimal
    bid: Decimal
    ask: Decimal
    bid_size: Decimal
    ask_size: Decimal
    volume_24h: Decimal
    change_pct: Decimal
    high_24h: Decimal
    low_24h: Decimal
    timestamp: datetime
    # 特有字段
    limit_up: Optional[Decimal] = None     # 涨停价 (A股/期货)
    limit_down: Optional[Decimal] = None   # 跌停价
    pre_close: Optional[Decimal] = None    # 昨收价
    turnover: Optional[Decimal] = None     # 成交额
    open_interest: Optional[Decimal] = None # 持仓量 (期货)

@dataclass
class UnifiedOrder:
    """统一订单"""
    id: str
    symbol: str
    market: MarketType
    side: OrderSide
    type: OrderType
    quantity: Decimal
    price: Optional[Decimal]
    filled_qty: Decimal = Decimal("0")
    avg_fill_price: Optional[Decimal] = None
    status: str = "pending"
    exchange_order_id: Optional[str] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    leverage: int = 1
    created_at: Optional[datetime] = None

@dataclass
class UnifiedPosition:
    """统一持仓"""
    symbol: str
    market: MarketType
    side: str              # long / short
    quantity: Decimal
    avg_entry_price: Decimal
    current_price: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_pct: Decimal
    leverage: int = 1
    margin_used: Optional[Decimal] = None
    liquidation_price: Optional[Decimal] = None  # 强平价 (加密/期货)

@dataclass
class MarketRules:
    """市场交易规则"""
    market: MarketType
    min_order_qty: Decimal
    qty_step: Decimal          # 最小变动单位
    price_precision: int
    qty_precision: int
    has_limit_price: bool      # 是否有涨跌停
    t_plus_n: int              # T+0 / T+1
    supports_short: bool
    max_leverage: int
    trading_hours: list[dict]  # [{"open":"09:30","close":"11:30","tz":"Asia/Shanghai"}]
    fee_structure: dict        # {"maker":0.001, "taker":0.001} 或 {"commission":0.0003}
    currency: str              # 计价货币

# ==================== 抽象适配器接口 ====================

class BaseMarketAdapter(ABC):
    """统一市场适配器基类"""

    market_type: MarketType

    @abstractmethod
    async def connect(self, credentials: dict) -> bool:
        """建立连接"""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """断开连接"""
        ...

    # ---- 行情数据 ----

    @abstractmethod
    async def get_klines(
        self, symbol: str, interval: str,
        start: Optional[datetime] = None,
        end: Optional[datetime] = None,
        limit: int = 500,
    ) -> list[UnifiedKline]:
        """获取 K 线历史数据"""
        ...

    @abstractmethod
    async def get_ticker(self, symbol: str) -> UnifiedTicker:
        """获取实时行情"""
        ...

    @abstractmethod
    async def search_symbols(self, keyword: str) -> list[UnifiedSymbol]:
        """搜索标的"""
        ...

    @abstractmethod
    async def subscribe_ticker(
        self, symbols: list[str]
    ) -> AsyncGenerator[UnifiedTicker, None]:
        """订阅实时行情流 (WebSocket)"""
        ...

    # ---- 交易操作 ----

    @abstractmethod
    async def place_order(self, order: UnifiedOrder) -> UnifiedOrder:
        """下单"""
        ...

    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """撤单"""
        ...

    @abstractmethod
    async def get_positions(self) -> list[UnifiedPosition]:
        """查询持仓"""
        ...

    @abstractmethod
    async def get_open_orders(self) -> list[UnifiedOrder]:
        """查询挂单"""
        ...

    @abstractmethod
    async def get_account_balance(self) -> dict:
        """查询账户余额"""
        ...

    @abstractmethod
    def get_market_rules(self, symbol: str) -> MarketRules:
        """获取交易规则"""
        ...
2. 各市场适配器实现
Python
# services/market_adapter/crypto_adapter.py

import ccxt.async_support as ccxt
from .base import *

class CryptoAdapter(BaseMarketAdapter):
    """加密货币适配器 — 基于 CCXT"""

    market_type = MarketType.CRYPTO

    def __init__(self, exchange_id: str = "binance"):
        self.exchange_id = exchange_id
        self.exchange: Optional[ccxt.Exchange] = None

    async def connect(self, credentials: dict) -> bool:
        exchange_class = getattr(ccxt, self.exchange_id)
        self.exchange = exchange_class({
            'apiKey': credentials.get('api_key'),
            'secret': credentials.get('api_secret'),
            'password': credentials.get('passphrase'),
            'options': {'defaultType': credentials.get('trade_type', 'spot')},
        })
        await self.exchange.load_markets()
        return True

    async def get_klines(self, symbol, interval, start=None, end=None, limit=500):
        ohlcv = await self.exchange.fetch_ohlcv(
            symbol, interval, since=int(start.timestamp()*1000) if start else None, limit=limit
        )
        return [
            UnifiedKline(
                symbol=symbol, market=self.market_type,
                timestamp=datetime.fromtimestamp(row[0]/1000),
                open=Decimal(str(row[1])), high=Decimal(str(row[2])),
                low=Decimal(str(row[3])), close=Decimal(str(row[4])),
                volume=Decimal(str(row[5])),
            )
            for row in ohlcv
        ]

    async def place_order(self, order: UnifiedOrder) -> UnifiedOrder:
        params = {}
        if order.stop_loss:
            params['stopLoss'] = {'triggerPrice': float(order.stop_loss)}
        if order.take_profit:
            params['takeProfit'] = {'triggerPrice': float(order.take_profit)}

        result = await self.exchange.create_order(
            symbol=order.symbol,
            type=order.type.value,
            side=order.side.value,
            amount=float(order.quantity),
            price=float(order.price) if order.price else None,
            params=params,
        )
        order.exchange_order_id = result['id']
        order.status = result['status']
        return order

    # ... 其他方法实现
Python
# services/market_adapter/us_stock_adapter.py

from ib_insync import IB, Stock, Order, MarketOrder, LimitOrder
from .base import *

class USStockAdapter(BaseMarketAdapter):
    """美股适配器 — 基于 IBKR TWS API"""

    market_type = MarketType.US_STOCK

    def __init__(self):
        self.ib = IB()

    async def connect(self, credentials: dict) -> bool:
        await self.ib.connectAsync(
            host=credentials.get('host', '127.0.0.1'),
            port=credentials.get('port', 7497),
            clientId=credentials.get('client_id', 1),
            readonly=credentials.get('readonly', False),
        )
        return self.ib.isConnected()

    async def get_klines(self, symbol, interval, start=None, end=None, limit=500):
        contract = Stock(symbol, 'SMART', 'USD')
        bars = await self.ib.reqHistoricalDataAsync(
            contract, endDateTime='', durationStr='1 Y',
            barSizeSetting=self._convert_interval(interval),
            whatToShow='TRADES', useRTH=True,
        )
        return [
            UnifiedKline(
                symbol=symbol, market=self.market_type,
                timestamp=bar.date, open=Decimal(str(bar.open)),
                high=Decimal(str(bar.high)), low=Decimal(str(bar.low)),
                close=Decimal(str(bar.close)), volume=Decimal(str(bar.volume)),
            )
            for bar in bars
        ]

    async def place_order(self, order: UnifiedOrder) -> UnifiedOrder:
        contract = Stock(order.symbol, 'SMART', 'USD')
        if order.type == OrderType.MARKET:
            ib_order = MarketOrder(order.side.value.upper(), float(order.quantity))
        else:
            ib_order = LimitOrder(order.side.value.upper(), float(order.quantity), float(order.price))
        trade = self.ib.placeOrder(contract, ib_order)
        order.exchange_order_id = str(trade.order.orderId)
        return order

    def get_market_rules(self, symbol: str) -> MarketRules:
        return MarketRules(
            market=self.market_type, min_order_qty=Decimal("1"),
            qty_step=Decimal("1"), price_precision=2, qty_precision=0,
            has_limit_price=False, t_plus_n=0, supports_short=True,
            max_leverage=4, currency="USD",
            trading_hours=[{"open":"09:30","close":"16:00","tz":"America/New_York"}],
            fee_structure={"commission_per_share": 0.005, "min_commission": 1.0},
        )

    # ... 其他方法
Python
# services/market_adapter/a_stock_adapter.py

import tushare as ts
import akshare as ak
from .base import *

class AStockAdapter(BaseMarketAdapter):
    """A股适配器 — 行情: Tushare/AKShare, 交易: QMT/PTrade"""

    market_type = MarketType.A_STOCK

    def __init__(self):
        self.ts_api = None
        self.trade_client = None  # QMT / PTrade

    async def connect(self, credentials: dict) -> bool:
        # 行情数据源
        ts.set_token(credentials.get('tushare_token', ''))
        self.ts_api = ts.pro_api()

        # 交易通道 (QMT)
        trade_type = credentials.get('trade_type', 'qmt')
        if trade_type == 'qmt':
            from .qmt_client import QMTClient
            self.trade_client = QMTClient(credentials)
            await self.trade_client.connect()
        return True

    async def get_klines(self, symbol, interval, start=None, end=None, limit=500):
        # 标准化代码: 600519 → 600519.SH
        ts_code = self._to_ts_code(symbol)
        df = self.ts_api.daily(
            ts_code=ts_code,
            start_date=start.strftime('%Y%m%d') if start else None,
            end_date=end.strftime('%Y%m%d') if end else None,
        )
        return [
            UnifiedKline(
                symbol=symbol, market=self.market_type,
                timestamp=datetime.strptime(row['trade_date'], '%Y%m%d'),
                open=Decimal(str(row['open'])), high=Decimal(str(row['high'])),
                low=Decimal(str(row['low'])), close=Decimal(str(row['close'])),
                volume=Decimal(str(row['vol'])),
                turnover=Decimal(str(row['amount'])) if row.get('amount') else None,
            )
            for _, row in df.iterrows()
        ]

    async def search_symbols(self, keyword: str) -> list[UnifiedSymbol]:
        df = self.ts_api.stock_basic(fields='ts_code,name,market,list_status')
        matches = df[df['name'].str.contains(keyword) | df['ts_code'].str.contains(keyword)]
        return [
            UnifiedSymbol(
                raw_symbol=row['ts_code'], market=self.market_type,
                asset_class=AssetClass.SPOT,
                base=row['ts_code'].split('.')[0],
                quote='CNY',
                exchange='SSE' if row['ts_code'].endswith('.SH') else 'SZSE',
                name=row['name'],
                display_name=row['name'],
            )
            for _, row in matches.head(20).iterrows()
        ]

    def get_market_rules(self, symbol: str) -> MarketRules:
        # A股: 科创板20%, 创业板20%, 主板10%
        board = self._detect_board(symbol)
        limit_pct = 20 if board in ['kcb', 'cyb'] else 10
        return MarketRules(
            market=self.market_type, min_order_qty=Decimal("100"),  # 1手=100股
            qty_step=Decimal("100"), price_precision=2, qty_precision=0,
            has_limit_price=True, t_plus_n=1, supports_short=False,  # 融券需另开
            max_leverage=2, currency="CNY",
            trading_hours=[
                {"open":"09:30","close":"11:30","tz":"Asia/Shanghai"},
                {"open":"13:00","close":"15:00","tz":"Asia/Shanghai"},
            ],
            fee_structure={
                "commission_rate": 0.0003,  # 万三
                "min_commission": 5.0,       # 最低5元
                "stamp_tax_sell": 0.001,     # 印花税千一 (卖出)
                "transfer_fee": 0.00002,     # 过户费
            },
        )

    def _to_ts_code(self, symbol: str) -> str:
        code = symbol.replace('.SH', '').replace('.SZ', '')
        if code.startswith(('6', '9')):
            return f"{code}.SH"
        return f"{code}.SZ"

    def _detect_board(self, symbol: str) -> str:
        code = symbol.split('.')[0]
        if code.startswith('688'):  return 'kcb'   # 科创板
        if code.startswith('300'):  return 'cyb'   # 创业板
        if code.startswith('8'):    return 'bse'   # 北交所
        return 'main'
Python
# services/market_adapter/hk_stock_adapter.py

from .base import *

class HKStockAdapter(BaseMarketAdapter):
    """港股适配器 — 行情+交易: 富途 OpenD / 长桥 / IBKR"""

    market_type = MarketType.HK_STOCK

    def __init__(self, broker: str = "futu"):
        self.broker = broker
        self.client = None

    async def connect(self, credentials: dict) -> bool:
        if self.broker == "futu":
            from futu import OpenQuoteContext, OpenTradeContext
            self.quote_ctx = OpenQuoteContext(
                host=credentials.get('host', '127.0.0.1'),
                port=credentials.get('port', 11111),
            )
            self.trade_ctx = OpenTradeContext(
                host=credentials.get('host', '127.0.0.1'),
                port=credentials.get('port', 11111),
            )
        elif self.broker == "longbridge":
            from longbridge.openapi import QuoteContext, TradeContext, Config
            config = Config.from_env()
            self.quote_ctx = QuoteContext(config)
            self.trade_ctx = TradeContext(config)
        elif self.broker == "ibkr":
            from ib_insync import IB, Stock
            self.ib = IB()
            await self.ib.connectAsync(
                host=credentials.get('host', '127.0.0.1'),
                port=credentials.get('port', 7497),
            )
        return True

    def get_market_rules(self, symbol: str) -> MarketRules:
        return MarketRules(
            market=self.market_type, min_order_qty=Decimal("1"),
            qty_step=Decimal("1"), price_precision=3, qty_precision=0,
            has_limit_price=False, t_plus_n=0, supports_short=True,
            max_leverage=4, currency="HKD",
            trading_hours=[
                {"open":"09:30","close":"12:00","tz":"Asia/Hong_Kong"},  # 上午盘
                {"open":"13:00","close":"16:00","tz":"Asia/Hong_Kong"},  # 下午盘
            ],
            fee_structure={
                "commission_rate": 0.0003,
                "platform_fee": 15.0,        # 平台使用费
                "stamp_duty": 0.0013,         # 印花税
                "trading_fee": 0.0000565,     # 交易费
                "settlement_fee": 0.00002,    # 交收费
            },
        )
Python
# services/market_adapter/futures_adapter.py

from .base import *

class FuturesAdapter(BaseMarketAdapter):
    """期货适配器 — 基于 CTP"""

    market_type = MarketType.FUTURES

    async def connect(self, credentials: dict) -> bool:
        from vnpy_ctp import CtpGateway
        self.gateway = CtpGateway(event_engine=None, gateway_name="CTP")
        setting = {
            "用户名": credentials['user_id'],
            "密码": credentials['password'],
            "经纪商代码": credentials['broker_id'],
            "交易服务器": credentials['td_address'],
            "行情服务器": credentials['md_address'],
            "产品名称": credentials.get('app_id', ''),
            "授权编码": credentials.get('auth_code', ''),
        }
        self.gateway.connect(setting)
        return True

    def get_market_rules(self, symbol: str) -> MarketRules:
        # 根据品种确定规则
        product = self._get_product_info(symbol)
        return MarketRules(
            market=self.market_type,
            min_order_qty=Decimal("1"),        # 1手
            qty_step=Decimal("1"),
            price_precision=product['price_tick_decimals'],
            qty_precision=0,
            has_limit_price=True,
            t_plus_n=0,
            supports_short=True,               # 期货天然支持做空
            max_leverage=product['leverage'],
            currency="CNY",
            trading_hours=product['trading_hours'],
            fee_structure={
                "commission_per_lot": product.get('commission_per_lot'),
                "commission_rate": product.get('commission_rate'),
                "close_today_rate": product.get('close_today_rate'),  # 平今费率
            },
        )

    def _get_product_info(self, symbol: str) -> dict:
        """期货品种信息表"""
        product_map = {
            'IF': {'name':'沪深300','exchange':'CFFEX','leverage':10,
                   'price_tick_decimals':1,
                   'trading_hours':[
                       {"open":"09:30","close":"11:30","tz":"Asia/Shanghai"},
                       {"open":"13:00","close":"15:00","tz":"Asia/Shanghai"},
                   ]},
            'IC': {'name':'中证500','exchange':'CFFEX','leverage':10,
                   'price_tick_decimals':1,'trading_hours':[...]},
            'rb': {'name':'螺纹钢','exchange':'SHFE','leverage':10,
                   'price_tick_decimals':0,
                   'trading_hours':[
                       {"open":"09:00","close":"10:15","tz":"Asia/Shanghai"},
                       {"open":"10:30","close":"11:30","tz":"Asia/Shanghai"},
                       {"open":"13:30","close":"15:00","tz":"Asia/Shanghai"},
                       {"open":"21:00","close":"23:00","tz":"Asia/Shanghai"},  # 夜盘
                   ]},
            'au': {'name':'黄金','exchange':'SHFE','leverage':10,
                   'price_tick_decimals':2,'trading_hours':[...]},
            # ... 更多品种
        }
        prefix = ''.join(c for c in symbol if c.isalpha())
        return product_map.get(prefix, {})
Python
# services/market_adapter/forex_adapter.py

import MetaTrader5 as mt5
from .base import *

class ForexAdapter(BaseMarketAdapter):
    """外汇适配器 — 基于 MetaTrader5"""

    market_type = MarketType.FOREX

    async def connect(self, credentials: dict) -> bool:
        if not mt5.initialize(
            path=credentials.get('mt5_path'),
            login=int(credentials['login']),
            password=credentials['password'],
            server=credentials['server'],
        ):
            return False
        return True

    async def get_klines(self, symbol, interval, start=None, end=None, limit=500):
        tf_map = {'1m':mt5.TIMEFRAME_M1,'5m':mt5.TIMEFRAME_M5,
                  '15m':mt5.TIMEFRAME_M15,'1H':mt5.TIMEFRAME_H1,
                  '4H':mt5.TIMEFRAME_H4,'1D':mt5.TIMEFRAME_D1}
        rates = mt5.copy_rates_from_pos(symbol, tf_map.get(interval, mt5.TIMEFRAME_D1), 0, limit)
        return [
            UnifiedKline(
                symbol=symbol, market=self.market_type,
                timestamp=datetime.fromtimestamp(r['time']),
                open=Decimal(str(r['open'])), high=Decimal(str(r['high'])),
                low=Decimal(str(r['low'])), close=Decimal(str(r['close'])),
                volume=Decimal(str(r['tick_volume'])),
            )
            for r in rates
        ]

    async def place_order(self, order: UnifiedOrder) -> UnifiedOrder:
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": order.symbol,
            "volume": float(order.quantity),
            "type": mt5.ORDER_TYPE_BUY if order.side == OrderSide.BUY else mt5.ORDER_TYPE_SELL,
            "price": float(order.price) if order.price else mt5.symbol_info_tick(order.symbol).ask,
            "deviation": 20,
            "magic": 234000,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        if order.stop_loss:
            request["sl"] = float(order.stop_loss)
        if order.take_profit:
            request["tp"] = float(order.take_profit)

        result = mt5.order_send(request)
        order.exchange_order_id = str(result.order)
        order.status = "filled" if result.retcode == mt5.TRADE_RETCODE_DONE else "failed"
        return order

    def get_market_rules(self, symbol: str) -> MarketRules:
        return MarketRules(
            market=self.market_type, min_order_qty=Decimal("0.01"),
            qty_step=Decimal("0.01"), price_precision=5, qty_precision=2,
            has_limit_price=False, t_plus_n=0, supports_short=True,
            max_leverage=500, currency=symbol[3:6],  # EURUSD → USD
            trading_hours=[
                {"open":"22:00 Sun","close":"22:00 Fri","tz":"UTC"},  # 5×24h
            ],
            fee_structure={"spread_pips": 1.2, "commission_per_lot": 7.0},
        )
3. 适配器工厂
Python
# services/market_adapter/factory.py

from .base import MarketType, BaseMarketAdapter
from .crypto_adapter import CryptoAdapter
from .us_stock_adapter import USStockAdapter
from .a_stock_adapter import AStockAdapter
from .hk_stock_adapter import HKStockAdapter
from .futures_adapter import FuturesAdapter
from .forex_adapter import ForexAdapter

class MarketAdapterFactory:
    """市场适配器工厂"""

    _adapters: dict[str, type[BaseMarketAdapter]] = {
        MarketType.CRYPTO:   CryptoAdapter,
        MarketType.US_STOCK: USStockAdapter,
        MarketType.A_STOCK:  AStockAdapter,
        MarketType.HK_STOCK: HKStockAdapter,
        MarketType.FUTURES:  FuturesAdapter,
        MarketType.FOREX:    ForexAdapter,
    }

    @classmethod
    def create(cls, market: MarketType, **kwargs) -> BaseMarketAdapter:
        adapter_class = cls._adapters.get(market)
        if not adapter_class:
            raise ValueError(f"Unsupported market: {market}")
        return adapter_class(**kwargs)

    @classmethod
    def register(cls, market: MarketType, adapter: type[BaseMarketAdapter]):
        """注册自定义适配器"""
        cls._adapters[market] = adapter
四、前端多市场 UI
1. 全球市场页面路由
Code
app/[locale]/(dashboard)/markets/
├── page.tsx                     # 全球市场总览 (所有市场卡片入口)
├── crypto/
│   ├── page.tsx                 # 加密货币列表 (涨跌幅/市值/24h量)
│   └── [symbol]/page.tsx        # 单币种详情 (K线/交易/AI分析)
├── us-stock/
│   ├── page.tsx                 # 美股列表 (三大指数/板块/个股)
│   └── [symbol]/page.tsx        # 单股详情
├── a-stock/
│   ├── page.tsx                 # A股列表 (上证/深证/科创/创业)
│   ├── [symbol]/page.tsx        # 单股详情
│   └── sectors/page.tsx         # 板块热力图
├── hk-stock/
│   ├── page.tsx                 # 港股列表 (恒生指数/个股)
│   └── [symbol]/page.tsx        # 单股详情
├── futures/
│   ├── page.tsx                 # 期货列表 (品种分类)
│   ├── [symbol]/page.tsx        # 单品种详情
│   └── calendar/page.tsx        # 合约日历 (到期/交割/换月)
└── forex/
    ├── page.tsx                 # 外汇列表 (主要/交叉/新兴)
    └── [pair]/page.tsx          # 单货币对详情
2. 市场切换组件
TSX
// components/markets/MarketSelector.tsx

"use client";

import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type MarketType = 'crypto' | 'us_stock' | 'a_stock' | 'hk_stock' | 'futures' | 'forex';

const marketConfig: Record<MarketType, {
  icon: string; color: string; badge?: string;
}> = {
  crypto:   { icon: '₿',  color: 'text-orange-500',  badge: '7×24h' },
  us_stock: { icon: '🇺🇸', color: 'text-blue-500' },
  a_stock:  { icon: '🇨🇳', color: 'text-red-500',    badge: 'T+1' },
  hk_stock: { icon: '🇭🇰', color: 'text-pink-500' },
  futures:  { icon: '📊', color: 'text-amber-500',   badge: '日+夜' },
  forex:    { icon: '💱', color: 'text-emerald-500',  badge: '5×24h' },
};

export function MarketSelector({
  value,
  onChange,
}: {
  value: MarketType;
  onChange: (market: MarketType) => void;
}) {
  const t = useTranslations('markets');

  const markets: { key: MarketType; label: string }[] = [
    { key: 'crypto',   label: t('crypto') },
    { key: 'us_stock', label: t('usStock') },
    { key: 'a_stock',  label: t('aStock') },
    { key: 'hk_stock', label: t('hkStock') },
    { key: 'futures',  label: t('futures') },
    { key: 'forex',    label: t('forex') },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
      {markets.map(({ key, label }) => {
        const config = marketConfig[key];
        const isActive = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'text-sm font-medium whitespace-nowrap transition-all',
              'border',
              isActive
                ? 'border-brand bg-brand/5 text-brand shadow-sm'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span>{config.icon}</span>
            <span>{label}</span>
            {config.badge && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {config.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
3. 统一交易面板 (适配不同市场规则)
TSX
// components/trading/UnifiedTradePanel.tsx

"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Info, Zap } from 'lucide-react';

type MarketType = 'crypto' | 'us_stock' | 'a_stock' | 'hk_stock' | 'futures' | 'forex';

interface MarketRules {
  market: MarketType;
  minQty: number;
  qtyStep: number;
  pricePrecision: number;
  hasLimitPrice: boolean;
  tPlusN: number;
  supportsShort: boolean;
  maxLeverage: number;
  currency: string;
  tradingHours: { open: string; close: string; tz: string }[];
}

export function UnifiedTradePanel({
  symbol,
  market,
  currentPrice,
  rules,
}: {
  symbol: string;
  market: MarketType;
  currentPrice: number;
  rules: MarketRules;
}) {
  const t = useTranslations('trading');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  // 根据市场规则动态调整 UI
  const showLeverage = ['crypto', 'futures', 'forex'].includes(market);
  const showShort = rules.supportsShort;
  const qtyLabel = market === 'a_stock' ? t('lots') : market === 'futures' ? t('contracts') : t('quantity');
  const qtyHint = market === 'a_stock' ? `${t('min')} 1${t('lot')} (100${t('shares')})` : '';

  // 交易时段检查
  const isMarketOpen = useMemo(() => {
    if (market === 'crypto') return true;  // 7×24
    const now = new Date();
    // 简化检查逻辑 ...
    return true;
  }, [market]);

  return (
    <div className="p-4 space-y-4">
      {/* 买/卖切换 */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={side === 'buy' ? 'default' : 'outline'}
          onClick={() => setSide('buy')}
          className={side === 'buy' ? 'bg-profit hover:bg-profit/90 text-white' : ''}
        >
          {market === 'futures' || market === 'forex' ? t('long') : t('buy')}
        </Button>
        {showShort ? (
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            onClick={() => setSide('sell')}
            className={side === 'sell' ? 'bg-loss hover:bg-loss/90 text-white' : ''}
          >
            {market === 'futures' || market === 'forex' ? t('short') : t('sell')}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" disabled className="opacity-50">
                {t('sell')}
                <AlertTriangle className="h-3 w-3 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('shortNotSupported')}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* 订单类型 */}
      <div className="space-y-1.5">
        <Label className="text-xs">{t('orderType')}</Label>
        <Select value={orderType} onValueChange={setOrderType}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">{t('marketOrder')}</SelectItem>
            <SelectItem value="limit">{t('limitOrder')}</SelectItem>
            <SelectItem value="stop">{t('stopOrder')}</SelectItem>
            {market === 'crypto' && (
              <SelectItem value="trailing">{t('trailingStop')}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 限价输入 (市价单隐藏) */}
      {orderType !== 'market' && (
        <div className="space-y-1.5">
          <Label className="text-xs">{t('price')} ({rules.currency})</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={currentPrice.toFixed(rules.pricePrecision)}
            step={Math.pow(10, -rules.pricePrecision)}
          />
          {rules.hasLimitPrice && (
            <p className="text-[11px] text-warning flex items-center gap-1">
              <Info className="h-3 w-3" />
              {t('limitPriceWarning')}
            </p>
          )}
        </div>
      )}

      {/* 数量 */}
      <div className="space-y-1.5">
        <Label className="text-xs">{qtyLabel}</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={`${t('min')} ${rules.minQty}`}
          step={rules.qtyStep}
        />
        {qtyHint && <p className="text-[11px] text-muted-foreground">{qtyHint}</p>}

        {/* 快捷百分比 */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <Button key={pct} variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => {/* 计算百分比数量 */}}>
              {pct}%
            </Button>
          ))}
        </div>
      </div>

      {/* 杠杆 (仅 加密/期货/外汇) */}
      {showLeverage && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{t('leverage')}</Label>
            <span className="text-sm font-bold">{leverage}x</span>
          </div>
          <Slider
            value={[leverage]}
            onValueChange={([v]) => setLeverage(v)}
            min={1}
            max={rules.maxLeverage}
            step={market === 'forex' ? 50 : 1}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1x</span>
            <span>{rules.maxLeverage}x</span>
          </div>
        </div>
      )}

      {/* 止损/止盈 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-loss">{t('stopLoss')}</Label>
          <Input
            type="number" value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder={t('optional')} className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-profit">{t('takeProfit')}</Label>
          <Input
            type="number" value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder={t('optional')} className="h-8 text-sm"
          />
        </div>
      </div>

      {/* 市场规则提示 */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('settlement')}</span>
          <Badge variant="outline" className="text-[10px] h-4">
            T+{rules.tPlusN}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('currency')}</span>
          <span className="font-medium">{rules.currency}</span>
        </div>
        {rules.hasLimitPrice && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('priceLimit')}</span>
            <span className="font-medium text-warning">{t('yes')}</span>
          </div>
        )}
      </div>

      {/* 下单按钮 */}
      <Button
        className={cn(
          'w-full h-11 font-bold text-base gap-2',
          side === 'buy'
            ? 'bg-profit hover:bg-profit/90 text-white'
            : 'bg-loss hover:bg-loss/90 text-white'
        )}
        disabled={!isMarketOpen}
      >
        <Zap className="h-4 w-4" />
        {side === 'buy'
          ? (market === 'futures' ? t('openLong') : t('confirmBuy'))
          : (market === 'futures' ? t('openShort') : t('confirmSell'))
        }
      </Button>

      {!isMarketOpen && (
        <p className="text-center text-xs text-warning flex items-center justify-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('marketClosed')}
        </p>
      )}
    </div>
  );
}
五、增补的翻译 (i18n)
JSON
// messages/zh.json — 新增市场相关翻译

{
  "markets": {
    "title": "全球市场",
    "crypto": "加密货币",
    "usStock": "美股",
    "aStock": "A股",
    "hkStock": "港股",
    "futures": "期货",
    "forex": "外汇",

    "indices": "指数",
    "sectors": "板块",
    "heatmap": "热力图",
    "watchlist": "自选股",

    "sse": "上海证券交易所",
    "szse": "深圳证券交易所",
    "bse": "北京证券交易所",
    "hkex": "香港联合交易所",
    "nasdaq": "纳斯达克",
    "nyse": "纽约证券交易所",

    "cffex": "中国金融期货交易所",
    "shfe": "上海期货交易所",
    "dce": "大连商品交易所",
    "czce": "郑州商品交易所",
    "gfex": "广州期货交易所",
    "ine": "上海国际能源交易中心",

    "mainBoard": "主板",
    "gemBoard": "创业板",
    "starBoard": "科创板",
    "bseBoard": "北交所",

    "spotMarket": "现货",
    "derivativesMarket": "衍生品",
    "marginTrading": "融资融券",

    "nightSession": "夜盘",
    "daySession": "日盘",
    "preMarket": "盘前交易",
    "afterHours": "盘后交易",

    "contractExpiry": "合约到期",
    "deliveryDate": "交割日",
    "rollover": "移仓换月",
    "openInterest": "持仓量",
    "settlementPrice": "结算价",

    "majorPairs": "主要货币对",
    "crossPairs": "交叉货币对",
    "exoticPairs": "新兴货币对",
    "spread": "点差",
    "pips": "点",
    "lotSize": "手数"
  },

  "trading": {
    "long": "做多",
    "short": "做空",
    "openLong": "开多",
    "openShort": "开空",
    "closeLong": "平多",
    "closeShort": "平空",
    "lots": "手数",
    "contracts": "合约数",
    "shares": "股",
    "settlement": "交割模式",
    "priceLimit": "涨跌停限制",
    "limitPriceWarning": "该市场存在涨跌停限制，请注意价格范围",
    "marketClosed": "当前不在交易时段",
    "shortNotSupported": "该市场不支持直接做空 (需开通融券)",
    "confirmBuy": "确认买入",
    "confirmSell": "确认卖出",
    "trailingStop": "追踪止损"
  }
}
六、增补的技术栈
Python 新增依赖
技术	用途	市场
tushare	A 股行情数据 (Pro 接口)	A股
akshare	A 股/期货免费数据	A股/期货
baostock	A 股基础数据 (备用)	A股
futu-api	富途 OpenD (行情+交易)	港股
longbridge	长桥证券 API	港股
tigeropen	老虎证券 API	港股/美股
vnpy + vnpy_ctp	CTP 期货交易网关	期货
MetaTrader5	MT5 外汇交易	外汇
ib_insync	IBKR 盈透证券	美股/港股
yfinance	Yahoo Finance 免费数据	美股/港股
polygon-api-client	Polygon.io 美股数据	美股
alpha_vantage	Alpha Vantage 数据	美股/外汇
exchange-calendars	全球交易所日历	全市场
pytz / zoneinfo	多时区处理	全市场
Go 新增依赖
技术	用途
exchange-calendars-go	交易所交易日历
decimal	高精度金融计算
timezone	多时区交易时段管理
七、增补的数据库表
SQL
-- ==================== 统一标的信息 ====================
CREATE TABLE symbols (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_symbol      VARCHAR(50) NOT NULL,     -- "AAPL", "600519.SH", "BTC/USDT"
    market          VARCHAR(20) NOT NULL,     -- crypto/us_stock/a_stock/hk_stock/futures/forex
    asset_class     VARCHAR(20) NOT NULL,     -- spot/margin/futures/perpetual/options/cfd
    base            VARCHAR(20) NOT NULL,     -- AAPL / 600519 / BTC
    quote           VARCHAR(10) NOT NULL,     -- USD / CNY / USDT
    exchange        VARCHAR(30) NOT NULL,     -- NASDAQ / SSE / binance
    name            VARCHAR(100),
    display_name    VARCHAR(100),             -- "苹果公司" / "贵州茅台"
    sector          VARCHAR(50),              -- 行业板块
    is_active       BOOLEAN DEFAULT TRUE,
    metadata        JSONB,                    -- 市场特有信息
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (raw_symbol, market, exchange)
);

CREATE INDEX idx_symbols_market ON symbols(market);
CREATE INDEX idx_symbols_search ON symbols USING gin(to_tsvector('simple', name || ' ' || display_name || ' ' || raw_symbol));

-- ==================== 期货合约信息 ====================
CREATE TABLE futures_contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code    VARCHAR(20) NOT NULL,     -- rb / IF / au
    product_name    VARCHAR(50),              -- 螺纹钢 / 沪深300 / 黄金
    exchange        VARCHAR(20) NOT NULL,     -- SHFE / CFFEX / DCE / CZCE
    contract_code   VARCHAR(20) NOT NULL,     -- rb2501 / IF2503
    delivery_month  DATE NOT NULL,
    list_date       DATE,
    expire_date     DATE,
    last_trade_date DATE,
    price_tick      DECIMAL(10,4),            -- 最小变动价位
    contract_size   INT,                      -- 合约乘数
    margin_rate     DECIMAL(5,4),             -- 保证金率
    trading_hours   JSONB,                    -- 交易时段 (含夜盘)
    status          VARCHAR(20) DEFAULT 'active',
    UNIQUE (contract_code, exchange)
);

-- ==================== 交易所凭证 (按市场扩展) ====================
ALTER TABLE exchange_credentials
    ADD COLUMN market VARCHAR(20) DEFAULT 'crypto',
    ADD COLUMN broker VARCHAR(30),             -- futu / longbridge / ibkr / ctp / mt5
    ADD COLUMN extra_config JSONB;             -- 市场特有配置

-- ==================== 订单表 (多市场字段) ====================
ALTER TABLE orders
    ADD COLUMN market VARCHAR(20) DEFAULT 'crypto',
    ADD COLUMN asset_class VARCHAR(20) DEFAULT 'spot',
    ADD COLUMN currency VARCHAR(10) DEFAULT 'USD',
    ADD COLUMN contract_code VARCHAR(20),      -- 期货合约代码
    ADD COLUMN commission DECIMAL(20,8),        -- 实际手续费
    ADD COLUMN stamp_tax DECIMAL(20,8),         -- 印花税 (A股)
    ADD COLUMN settlement_date DATE;            -- 交割日

-- ==================== 持仓表 (多市场字段) ====================
ALTER TABLE positions
    ADD COLUMN market VARCHAR(20) DEFAULT 'crypto',
    ADD COLUMN asset_class VARCHAR(20) DEFAULT 'spot',
    ADD COLUMN currency VARCHAR(10) DEFAULT 'USD',
    ADD COLUMN contract_code VARCHAR(20),
    ADD COLUMN margin_used DECIMAL(20,8),
    ADD COLUMN liquidation_price DECIMAL(20,8),
    ADD COLUMN settlement_price DECIMAL(20,8);  -- 期货结算价

-- ==================== 交易时段管理 ====================
CREATE TABLE market_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market          VARCHAR(20) NOT NULL,
    exchange        VARCHAR(30) NOT NULL,
    session_name    VARCHAR(30) NOT NULL,      -- 'morning' / 'afternoon' / 'night'
    open_time       TIME NOT NULL,
    close_time      TIME NOT NULL,
    timezone        VARCHAR(50) NOT NULL,      -- 'Asia/Shanghai'
    days_of_week    INT[] DEFAULT '{1,2,3,4,5}', -- 1=Mon ... 5=Fri
    is_active       BOOLEAN DEFAULT TRUE
);

-- 初始化常用交易时段
INSERT INTO market_sessions (market, exchange, session_name, open_time, close_time, timezone) VALUES
('a_stock',  'SSE',   'morning',   '09:30', '11:30', 'Asia/Shanghai'),
('a_stock',  'SSE',   'afternoon', '13:00', '15:00', 'Asia/Shanghai'),
('hk_stock', 'HKEX',  'morning',   '09:30', '12:00', 'Asia/Hong_Kong'),
('hk_stock', 'HKEX',  'afternoon', '13:00', '16:00', 'Asia/Hong_Kong'),
('us_stock', 'NYSE',  'regular',   '09:30', '16:00', 'America/New_York'),
('us_stock', 'NYSE',  'pre',       '04:00', '09:30', 'America/New_York'),
('us_stock', 'NYSE',  'after',     '16:00', '20:00', 'America/New_York'),
('futures',  'SHFE',  'morning1',  '09:00', '10:15', 'Asia/Shanghai'),
('futures',  'SHFE',  'morning2',  '10:30', '11:30', 'Asia/Shanghai'),
('futures',  'SHFE',  'afternoon', '13:30', '15:00', 'Asia/Shanghai'),
('futures',  'SHFE',  'night',     '21:00', '23:00', 'Asia/Shanghai'),
('futures',  'CFFEX', 'morning',   '09:30', '11:30', 'Asia/Shanghai'),
('futures',  'CFFEX', 'afternoon', '13:00', '15:00', 'Asia/Shanghai'),
('forex',    'MT5',   'full',      '22:00', '22:00', 'UTC');  -- 5×24h
八、AI 分析多市场扩展
Python
# AI 分析 prompt 按市场定制

MARKET_ANALYSIS_PROMPTS = {
    MarketType.A_STOCK: """
你是一位资深A股分析师。请基于以下数据分析该股票:
- 注意 A 股特有因素: 涨跌停板制度、T+1 交割、北向资金流向、融资融券余额
- 关注政策面: 行业政策、监管动态、宏观经济数据
- 技术面需考虑: 龙虎榜、大宗交易、股东增减持
- 板块联动: 同行业/同概念股票的表现
- 输出语言: {locale}
""",

    MarketType.FUTURES: """
你是一位资深期货分析师。请基于以下数据分析该品种:
- 关注基本面: 供需关系、库存数据、产业链上下游
- 注意期货特有指标: 持仓量变化、基差、期限结构 (contango/backwardation)
- 关注交割: 合约到期日、移仓换月时机
- 宏观因素: 汇率、利率、地缘政治
- 风控: 保证金率变化、涨跌停扩板
- 输出语言: {locale}
""",

    MarketType.FOREX: """
你是一位资深外汇分析师。请基于以下数据分析该货币对:
- 宏观经济: 两国GDP/CPI/就业数据对比
- 央行政策: 利率决议、QE/QT、前瞻指引
- 技术分析: 斐波那契、枢轴点、艾略特波浪
- 关注: 伦敦/纽约/亚洲盘交接时段流动性变化
- 地缘政治与避险情绪对货币对的影响
- 输出语言: {locale}
""",
}
九、终版技术栈增补总表
Code
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─── 新增 Python 依赖 ─────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │  A股:    tushare · akshare · baostock                                │ │
│   │  港股:   futu-api · longbridge · tigeropen                           │ │
│   │  美股:   ib_insync · yfinance · polygon-api-client · alpha_vantage   │ │
│   │  期货:   vnpy · vnpy_ctp                                            │ │
│   │  外汇:   MetaTrader5                                                │ │
│   │  通用:   exchange-calendars · pytz                                   │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   ┌─── 架构新增 ─────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │  统一市场适配器层 (Unified Market Adapter Layer)                       │ │
│   │  ├── BaseMarketAdapter (抽象基类)                                     │ │
│   │  ├── CryptoAdapter    (CCXT)                                         │ │
│   │  ├── USStockAdapter   (IBKR / Alpaca)                                │ │
│   │  ├── AStockAdapter    (Tushare + QMT)                                │ │
│   │  ├── HKStockAdapter   (Futu / Longbridge / IBKR)                     │ │
│   │  ├── FuturesAdapter   (CTP / vnpy)                                   │ │
│   │  ├── ForexAdapter     (MT5 / OANDA)                                  │ │
│   │  └── MarketAdapterFactory (工厂)                                     │ │
│   │                                                                       │ │
│   │  统一数据结构:                                                        │ │
│   │  UnifiedSymbol · UnifiedKline · UnifiedTicker                        │ │
│   │  UnifiedOrder  · UnifiedPosition · MarketRules                       │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
以上方案完整覆盖了六大市场的行情数据接入、交易通道对接、前端 UI 适配、交易规则差异化处理和 AI 分析定制。所有市场通过统一适配器层抹平差异，上层业务代码（策略引擎/回测/AI 分析/前端）只需面对统一的 UnifiedOrder / UnifiedKline 等数据结构即可。

如果准备好了仓库，告诉我从哪个市场开始落地，我来创建 PR。
