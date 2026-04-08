# CryptoHub · 加密货币趋势分析与量化交易平台

<p align="center">
  <strong>Enterprise-grade Cryptocurrency Trend Analysis & Quantitative Trading Platform</strong><br/>
  <strong>企业级加密货币趋势分析与量化交易平台</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018-blue" />
  <img src="https://img.shields.io/badge/Analysis-FastAPI-green" />
  <img src="https://img.shields.io/badge/Trading-Go%2FGin-cyan" />
  <img src="https://img.shields.io/badge/Mobile-Flutter-blue" />
  <img src="https://img.shields.io/badge/MiniProgram-Taro-orange" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📖 目录 / Table of Contents

- [项目简介 / Overview](#-项目简介--overview)
- [系统架构 / Architecture](#-系统架构--architecture)
- [技术栈 / Tech Stack](#-技术栈--tech-stack)
- [功能模块 / Feature Modules](#-功能模块--feature-modules)
- [趋势分析引擎 / Trend Analysis Engine](#-趋势分析引擎--trend-analysis-engine)
- [快速开始 / Quick Start](#-快速开始--quick-start)
- [项目结构 / Project Structure](#-项目结构--project-structure)
- [API 文档 / API Documentation](#-api-文档--api-documentation)
- [多语言支持 / i18n](#-多语言支持--i18n)
- [主题切换 / Theming](#-主题切换--theming)
- [部署指南 / Deployment](#-部署指南--deployment)
- [贡献指南 / Contributing](#-贡献指南--contributing)
- [许可证 / License](#-许可证--license)

---

## 🌟 项目简介 / Overview

**中文：**

CryptoHub 是一个企业级全栈加密货币趋势分析与量化交易平台。平台通过整合宏观经济、政策法规、市场供需、市场情绪和技术分析五大维度的量化因子，基于可配置的权重和动态增强系数，生成精准的趋势分析报告。同时支持多交易所API集成（Binance、OKX等），提供量化交易、策略交易、手动交易等多种交易方式。

**English:**

CryptoHub is an enterprise-grade full-stack cryptocurrency trend analysis and quantitative trading platform. It integrates quantifiable factors across five dimensions — macroeconomics, policy & regulation, supply & demand, market sentiment, and technical analysis — with configurable weights and dynamic boost coefficients to generate precise trend analysis reports. The platform supports multi-exchange API integration (Binance, OKX, etc.) and offers quantitative trading, strategy-based trading, and manual trading capabilities.

---

## 🏗 系统架构 / Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (反向代理 / Reverse Proxy)           │
├──────────┬──────────────────────────┬───────────────────────────┤
│ Frontend │   Analysis Service       │   Trading Service         │
│ React+TS │   Python / FastAPI       │   Go / Gin                │
│ Vite     │   趋势分析引擎            │   交易执行引擎              │
│ Ant Design│   Trend Analysis Engine  │   Trade Execution Engine  │
│ Port 3000│   Port 8000              │   Port 8001               │
├──────────┴──────────────────────────┴───────────────────────────┤
│                        Apache Kafka (消息队列)                    │
├─────────────────┬──────────────────┬────────────────────────────┤
│  PostgreSQL     │     Redis        │    InfluxDB                │
│  关系型数据      │     缓存/限流     │    时序行情数据              │
│  Relational DB  │     Cache/Limit  │    Time-series Market Data │
└─────────────────┴──────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     多端客户端 / Multi-platform Clients           │
├────────────┬────────────┬────────────┬──────────────────────────┤
│   Web SPA  │  Flutter   │  微信小程序  │     抖音小程序              │
│   React    │  Android   │  WeChat    │     Douyin               │
│            │  iOS       │  Mini      │     Mini                 │
│            │  HarmonyOS │  Program   │     Program              │
└────────────┴────────────┴────────────┴──────────────────────────┘
```

---

## 🛠 技术栈 / Tech Stack

| 层级 / Layer | 技术 / Technology | 说明 / Description |
|---|---|---|
| **前端 / Frontend** | React 18 · TypeScript · Vite · Ant Design 5 · Recharts | SPA 单页应用，Binance 风格 UI |
| **后端-分析 / Backend-Analysis** | Python · FastAPI · Uvicorn · Pandas · NumPy | 趋势分析引擎，市场数据聚合 |
| **后端-交易 / Backend-Trading** | Go · Gin · gorilla/websocket | 高性能交易引擎，实时 WebSocket |
| **移动端 / Mobile App** | Flutter · Riverpod · go_router · fl_chart | Android / iOS / HarmonyOS |
| **小程序 / Mini Program** | Taro 3 · React · TypeScript | 微信 / 抖音 / H5 |
| **数据库 / Database** | PostgreSQL 16 · Redis 7 · InfluxDB 2.7 | 关系型 + 缓存 + 时序 |
| **消息队列 / MQ** | Apache Kafka 3.7 (KRaft) | 事件驱动架构 |
| **部署 / Deploy** | Docker · Docker Compose · Nginx | 容器化一键部署 |

---

## 📦 功能模块 / Feature Modules

### 1. 仪表盘 / Dashboard
- **资产总览 / Asset Overview**: 总资产、24h盈亏、持仓分布
- **市场概况 / Market Summary**: Top 加密货币实时行情
- **策略状态 / Strategy Status**: 运行中策略的实时状态
- **最近交易 / Recent Trades**: 最新交易记录
- **快速操作 / Quick Actions**: 一键买卖、创建策略、生成报告

### 2. 市场/趋势分析 / Market & Trend Analysis
- **宏观经济分析 / Macro Economic**: CPI、利率、美元指数、就业数据、M2货币供应
- **政策法规分析 / Policy & Regulation**: 美/中/欧加密政策、SEC执法
- **市场供需分析 / Supply & Demand**: 交易所储备、巨鲸动向、算力、ETF资金流
- **市场情绪分析 / Market Sentiment**: 恐惧贪婪指数、社交媒体、Google趋势、资金费率
- **技术层面分析 / Technical Analysis**: RSI、MACD、布林带、MA200、成交量

### 3. 交易模块 / Trading Module
- **策略管理 / Strategy Management**: 创建、编辑、启停策略
- **策略编辑器 / Strategy Editor**: 自定义策略代码
- **回测系统 / Backtesting**: 历史数据回测，夏普比率、最大回撤等指标
- **实盘交易 / Live Trading**: 连接交易所真实下单
- **虚拟盘交易 / Paper Trading**: 模拟交易不花真钱
- **组合管理 / Portfolio Management**: 多币种资产组合
- **风险管理 / Risk Management**: 仓位限制、杠杆限制、日亏损限制

### 4. 个人中心 / Profile
- **用户管理 / User Management**: 注册、登录、个人信息
- **交易设置 / Trading Settings**: 各币种默认杠杆、止盈止损
- **API设置 / API Keys**: 对接 Binance、OKX 等交易所
- **资金流水 / Fund Flow**: 充值、提现、交易、手续费记录
- **订阅管理 / Subscription**: 免费版/专业版/企业版
- **通知偏好 / Notifications**: 邮件、短信、推送、微信通知

### 5. 系统设置 / System Settings
- **因子权重管理 / Factor Weight Management**: 调整分析因子权重
- **币种因子配置 / Per-coin Factor Config**: BTC/ETH 独立因子权重和增强系数
- **动态增强系数 / Boost Coefficients**: 重大事件时动态调整

---

## 🔬 趋势分析引擎 / Trend Analysis Engine

### 核心算法 / Core Algorithm

```
最终得分 / Final Score = Σ(factor_score × weight × boost_coefficient) / Σ(weight × boost_coefficient) × 100
```

| 参数 / Parameter | 说明 / Description | 范围 / Range |
|---|---|---|
| `factor_score` | 单因子得分 / Individual factor score | -100 ~ +100 |
| `weight` | 因子权重 / Factor weight | 0 ~ 1 (总和≈1) |
| `boost_coefficient` | 动态增强系数 / Dynamic boost coefficient | 0.1 ~ 5.0 (默认 1.0) |
| `final_score` | 综合趋势得分 / Overall trend score | -100 ~ +100 |

### 趋势信号映射 / Signal Mapping

| 得分范围 / Score Range | 信号 / Signal | 含义 / Meaning |
|---|---|---|
| -100 ~ -60 | 🔴 `strong_sell` | 强烈看跌 / Strongly Bearish |
| -60 ~ -20  | 🟠 `sell`        | 看跌 / Bearish |
| -20 ~ +20  | 🟡 `neutral`     | 中性 / Neutral |
| +20 ~ +60  | 🟢 `buy`         | 看涨 / Bullish |
| +60 ~ +100 | 🟢 `strong_buy`  | 强烈看涨 / Strongly Bullish |

### 22 个量化因子 / 22 Quantifiable Factors

系统预设 22 个分析因子，分布在 5 大类别中，每个因子都有独立的数据源：

The system includes 22 pre-configured analysis factors across 5 categories, each with an independent data source:

| 类别 / Category | 因子数 / Factors | 数据源示例 / Data Sources |
|---|---|---|
| 宏观经济 / Macro | 5 | FRED API, Yahoo Finance |
| 政策法规 / Policy | 4 | News Scraper, SEC RSS |
| 供需分析 / Supply & Demand | 4 | CryptoQuant, Whale Alert, Blockchain.com |
| 市场情绪 / Sentiment | 4 | Alternative.me, LunarCrush, Google Trends |
| 技术分析 / Technical | 5 | 本地计算 / Calculated locally |

### 币种独立配置 / Per-coin Configuration

不同币种（如 BTC 和 ETH）可以有不同的因子权重和增强系数，通过 `coin_factor_overrides` 表实现。相同的全局因子共用基础配置，但可以在币种级别覆盖。

Different cryptocurrencies (e.g., BTC vs ETH) can have different factor weights and boost coefficients via the `coin_factor_overrides` table. Global factors share base configuration but can be overridden at the coin level.

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites

- Docker 24+ & Docker Compose v2
- Node.js 20+ (前端开发 / frontend dev)
- Python 3.11+ (分析服务开发 / analysis dev)
- Go 1.22+ (交易服务开发 / trading dev)
- Flutter 3.22+ (移动端开发 / mobile dev)

### 一键启动 / One-click Start

```bash
# 克隆项目 / Clone the repository
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# 复制环境变量 / Copy environment variables
cp .env.example .env

# 启动所有服务 / Start all services
docker compose up -d

# 访问 / Access
# Web UI:       http://localhost
# Analysis API: http://localhost:8000/docs
# Trading API:  http://localhost:8001/api/v1/trading/
```

### 开发模式 / Development Mode

```bash
# 前端开发 / Frontend development
cd frontend
npm install
npm run dev          # http://localhost:5173

# 分析服务 / Analysis service
cd backend/analysis
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 交易服务 / Trading service
cd backend/trading
go mod tidy
go run main.go       # http://localhost:8001

# Flutter 移动端 / Flutter mobile app
cd app
flutter pub get
flutter run

# 小程序 / Mini program
cd miniprogram
npm install
npm run dev:weapp    # 微信小程序
npm run dev:h5       # H5 网页版
```

---

## 📁 项目结构 / Project Structure

```
cryptohub/
├── frontend/                   # React Web 前端
│   ├── src/
│   │   ├── components/         # 可复用组件 (Layout, Charts, Common)
│   │   ├── pages/              # 页面 (Dashboard, Market, Trading, Profile, Settings)
│   │   ├── store/              # Zustand 状态管理
│   │   ├── api/                # API 调用层
│   │   ├── i18n/               # 国际化 (zh-CN, en-US)
│   │   └── styles/             # 主题与全局样式
│   └── Dockerfile
│
├── backend/
│   ├── analysis/               # Python FastAPI 分析服务
│   │   ├── app/
│   │   │   ├── api/            # API 路由 (auth, dashboard, analysis, settings)
│   │   │   ├── models/         # SQLAlchemy 数据模型
│   │   │   ├── schemas/        # Pydantic 请求/响应模型
│   │   │   ├── services/       # 核心服务 (trend_engine, technical, sentiment, market_data)
│   │   │   └── core/           # 基础设施 (database, redis, security)
│   │   └── Dockerfile
│   │
│   └── trading/                # Go Gin 交易服务
│       ├── internal/
│       │   ├── handlers/       # HTTP 处理器
│       │   ├── services/       # 交易引擎, 回测, 风控, 交易所客户端
│       │   ├── middleware/     # 认证, CORS, 限流
│       │   └── ws/             # WebSocket 实时推送
│       └── Dockerfile
│
├── app/                        # Flutter 移动端
│   └── lib/
│       ├── screens/            # 界面 (dashboard, market, trading, profile)
│       ├── providers/          # Riverpod 状态管理
│       ├── services/           # API 和 WebSocket 服务
│       └── widgets/            # 可复用组件
│
├── miniprogram/                # Taro 小程序 (微信/抖音/H5)
│   └── src/
│       ├── pages/              # 页面
│       ├── components/         # 组件
│       └── api/                # API 层
│
├── database/
│   └── migrations/             # SQL 数据库迁移脚本
│
├── docker/
│   └── nginx/                  # Nginx 反向代理配置
│
├── docs/                       # 文档
├── docker-compose.yml          # 容器编排
└── .env.example                # 环境变量模板
```

---

## 📡 API 文档 / API Documentation

### 分析服务 / Analysis Service (Port 8000)

| 方法 / Method | 路径 / Path | 说明 / Description |
|---|---|---|
| POST | `/api/v1/auth/register` | 用户注册 / User registration |
| POST | `/api/v1/auth/login` | 用户登录 / User login |
| POST | `/api/v1/auth/refresh` | 刷新令牌 / Refresh token |
| GET | `/api/v1/dashboard/overview` | 仪表盘概览 / Dashboard overview |
| GET | `/api/v1/dashboard/market-summary` | 市场概况 / Market summary |
| GET | `/api/v1/dashboard/recent-trades` | 最近交易 / Recent trades |
| GET | `/api/v1/dashboard/strategy-status` | 策略状态 / Strategy status |
| GET | `/api/v1/analysis/trend/{symbol}` | 获取趋势报告 / Get trend report |
| POST | `/api/v1/analysis/trend/{symbol}/generate` | 生成趋势报告 / Generate trend report |
| GET | `/api/v1/analysis/factors` | 分析因子列表 / List factors |
| PUT | `/api/v1/analysis/factors/{id}` | 更新因子 / Update factor |
| GET | `/api/v1/analysis/reports` | 报告列表 / List reports |
| GET/PUT | `/api/v1/settings/profile` | 用户配置 / User profile |
| GET/PUT | `/api/v1/settings/factors/{id}` | 因子设置 / Factor settings |
| GET/PUT | `/api/v1/settings/coins/{symbol}/factors/{id}` | 币种因子覆盖 / Coin factor overrides |

### 交易服务 / Trading Service (Port 8001)

| 方法 / Method | 路径 / Path | 说明 / Description |
|---|---|---|
| GET/POST | `/api/v1/trading/strategies/` | 策略列表/创建 / List/Create strategies |
| GET/PUT/DELETE | `/api/v1/trading/strategies/:id` | 策略详情/更新/删除 / Strategy CRUD |
| POST | `/api/v1/trading/strategies/:id/start` | 启动策略 / Start strategy |
| POST | `/api/v1/trading/strategies/:id/stop` | 停止策略 / Stop strategy |
| POST | `/api/v1/trading/orders/` | 下单 / Place order |
| GET | `/api/v1/trading/orders/` | 订单列表 / List orders |
| DELETE | `/api/v1/trading/orders/:id` | 取消订单 / Cancel order |
| POST | `/api/v1/trading/backtest/` | 运行回测 / Run backtest |
| GET | `/api/v1/trading/backtest/:id` | 回测结果 / Backtest results |
| GET/POST | `/api/v1/trading/portfolios/` | 组合管理 / Portfolio management |
| WS | `/ws/` | WebSocket 实时数据 / Real-time WebSocket |

---

## 🌐 多语言支持 / i18n

平台支持中英文切换，所有端（Web、App、小程序）统一使用以下语言标识：

The platform supports Chinese/English switching across all clients (Web, App, Mini Program):

| 标识 / Code | 语言 / Language |
|---|---|
| `zh-CN` | 简体中文 / Simplified Chinese |
| `en-US` | English (US) |

各端实现方式 / Implementation per platform:

| 端 / Platform | 方案 / Solution |
|---|---|
| Web (React) | `react-i18next` with JSON translation files |
| Flutter | Custom `Translations` map + `LocaleProvider` |
| Taro | Custom `t()` function with language maps |

---

## 🎨 主题切换 / Theming

支持三种主题模式 / Three theme modes supported:

| 模式 / Mode | 说明 / Description |
|---|---|
| 🌙 Dark | 深色模式（默认），仿 Binance 风格 / Dark mode (default), Binance-style |
| ☀️ Light | 浅色模式 / Light mode |
| 🔄 Auto | 跟随系统设置 / Follow system preference |

### 配色方案 / Color Palette

| 用途 / Usage | Dark Mode | Light Mode |
|---|---|---|
| 背景 / Background | `#0B0E11` | `#FAFAFA` |
| 卡片 / Card | `#1E2329` | `#FFFFFF` |
| 主色 / Primary | `#F0B90B` (金色/Gold) | `#F0B90B` |
| 涨 / Positive | `#0ECB81` (绿色/Green) | `#0ECB81` |
| 跌 / Negative | `#F6465D` (红色/Red) | `#F6465D` |
| 文字 / Text | `#EAECEF` | `#1E2329` |

---

## 🚢 部署指南 / Deployment

### Docker 生产部署 / Docker Production Deployment

```bash
# 1. 配置环境变量 / Configure environment
cp .env.example .env
# 编辑 .env 修改密码和密钥 / Edit .env to change passwords and secrets

# 2. 构建并启动 / Build and start
docker compose up -d --build

# 3. 检查服务状态 / Check service status
docker compose ps

# 4. 查看日志 / View logs
docker compose logs -f analysis
docker compose logs -f trading
```

### 服务端口 / Service Ports

| 服务 / Service | 端口 / Port | 说明 / Description |
|---|---|---|
| Nginx | 80, 443 | 反向代理 / Reverse proxy |
| Frontend | 3000 | Web 前端 |
| Analysis API | 8000 | 分析服务 |
| Trading API | 8001 | 交易服务 |
| PostgreSQL | 5432 | 关系型数据库 |
| Redis | 6379 | 缓存 |
| InfluxDB | 8086 | 时序数据库 |
| Kafka | 9092 | 消息队列 |

---

## 🤝 贡献指南 / Contributing

欢迎提交 Issue 和 Pull Request！

We welcome Issues and Pull Requests!

1. Fork 本仓库 / Fork this repository
2. 创建功能分支 / Create a feature branch: `git checkout -b feature/amazing-feature`
3. 提交更改 / Commit changes: `git commit -m 'Add amazing feature'`
4. 推送分支 / Push branch: `git push origin feature/amazing-feature`
5. 提交 PR / Open a Pull Request

---

## 📄 许可证 / License

本项目采用 MIT 许可证 / This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the CryptoHub Team<br/>
  由 CryptoHub 团队用 ❤️ 构建
</p>
