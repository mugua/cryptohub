# CryptoHub · Cryptocurrency Trend Analysis & Quantitative Trading Platform

<p align="center">
  <strong>Enterprise-grade Cryptocurrency Trend Analysis & Quantitative Trading Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018-blue" />
  <img src="https://img.shields.io/badge/Analysis-FastAPI-green" />
  <img src="https://img.shields.io/badge/Trading-Go%2FGin-cyan" />
  <img src="https://img.shields.io/badge/Mobile-Flutter-blue" />
  <img src="https://img.shields.io/badge/MiniProgram-Taro-orange" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

> **[中文文档 / Chinese Documentation](README_ZH.md)**

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Feature Modules](#-feature-modules)
- [Trend Analysis Engine](#-trend-analysis-engine)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [i18n](#-i18n)
- [Theming](#-theming)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

CryptoHub is an enterprise-grade full-stack cryptocurrency trend analysis and quantitative trading platform. It integrates quantifiable factors across five dimensions — macroeconomics, policy & regulation, supply & demand, market sentiment, and technical analysis — with configurable weights and dynamic boost coefficients to generate precise trend analysis reports. The platform supports multi-exchange API integration (Binance, OKX, etc.) and offers quantitative trading, strategy-based trading, and manual trading capabilities.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (Reverse Proxy)                     │
├──────────┬──────────────────────────┬───────────────────────────┤
│ Frontend │   Analysis Service       │   Trading Service         │
│ React+TS │   Python / FastAPI       │   Go / Gin                │
│ Vite     │   Trend Analysis Engine  │   Trade Execution Engine  │
│ Ant Design│                         │                           │
│ Port 3000│   Port 8000              │   Port 8001               │
├──────────┴──────────────────────────┴───────────────────────────┤
│                        Apache Kafka (Message Queue)              │
├─────────────────┬──────────────────┬────────────────────────────┤
│  PostgreSQL     │     Redis        │    InfluxDB                │
│  Relational DB  │     Cache/Limit  │    Time-series Market Data │
└─────────────────┴──────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Multi-platform Clients                       │
├────────────┬────────────┬────────────┬──────────────────────────┤
│   Web SPA  │  Flutter   │  WeChat    │     Douyin               │
│   React    │  Android   │  Mini      │     Mini                 │
│            │  iOS       │  Program   │     Program              │
│            │  HarmonyOS │            │                          │
└────────────┴────────────┴────────────┴──────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 · TypeScript · Vite · Ant Design 5 · Recharts | SPA, Binance-style UI |
| **Backend-Analysis** | Python · FastAPI · Uvicorn · Pandas · NumPy | Trend analysis engine, market data aggregation |
| **Backend-Trading** | Go · Gin · gorilla/websocket | High-performance trading engine, real-time WebSocket |
| **Mobile App** | Flutter · Riverpod · go_router · fl_chart | Android / iOS / HarmonyOS |
| **Mini Program** | Taro 3 · React · TypeScript | WeChat / Douyin / H5 |
| **Database** | PostgreSQL 16 · Redis 7 · InfluxDB 2.7 | Relational + Cache + Time-series |
| **MQ** | Apache Kafka 3.7 (KRaft) | Event-driven architecture |
| **Deploy** | Docker · Docker Compose · Nginx | Containerized one-click deployment |

---

## 📦 Feature Modules

### 1. Dashboard
- **Asset Overview**: Total assets, 24h PnL, position distribution
- **Market Summary**: Top cryptocurrency real-time quotes
- **Strategy Status**: Real-time status of running strategies
- **Recent Trades**: Latest trade records
- **Quick Actions**: One-click buy/sell, create strategy, generate report

### 2. Market & Trend Analysis
- **Macro Economic**: CPI, interest rates, US Dollar Index, employment data, M2 money supply
- **Policy & Regulation**: US/China/EU crypto policies, SEC enforcement
- **Supply & Demand**: Exchange reserves, whale movements, hashrate, ETF fund flows
- **Market Sentiment**: Fear & Greed Index, social media, Google Trends, funding rate
- **Technical Analysis**: RSI, MACD, Bollinger Bands, MA200, volume

### 3. Trading Module
- **Strategy Management**: Create, edit, start/stop strategies
- **Strategy Editor**: Custom strategy code
- **Backtesting**: Historical data backtesting, Sharpe ratio, max drawdown metrics
- **Live Trading**: Connect to exchanges for real orders
- **Paper Trading**: Simulated trading without real money
- **Portfolio Management**: Multi-coin asset portfolios
- **Risk Management**: Position limits, leverage limits, daily loss limits

### 4. Profile
- **User Management**: Registration, login, profile management
- **Trading Settings**: Per-coin default leverage, stop-loss/take-profit
- **API Keys**: Connect Binance, OKX and other exchanges
- **Fund Flow**: Deposit, withdrawal, trade, and fee records
- **Subscription**: Free / Pro / Enterprise plans
- **Notifications**: Email, SMS, push, WeChat notifications

### 5. System Settings
- **Factor Weight Management**: Adjust analysis factor weights
- **Per-coin Factor Config**: BTC/ETH independent factor weights and boost coefficients
- **Boost Coefficients**: Dynamic adjustment during major events

---

## 🔬 Trend Analysis Engine

### Core Algorithm

```
Final Score = Σ(factor_score × weight × boost_coefficient) / Σ(weight × boost_coefficient) × 100
```

| Parameter | Description | Range |
|---|---|---|
| `factor_score` | Individual factor score | -100 ~ +100 |
| `weight` | Factor weight | 0 ~ 1 (sum ≈ 1) |
| `boost_coefficient` | Dynamic boost coefficient | 0.1 ~ 5.0 (default 1.0) |
| `final_score` | Overall trend score | -100 ~ +100 |

### Signal Mapping

| Score Range | Signal | Meaning |
|---|---|---|
| -100 ~ -60 | 🔴 `strong_sell` | Strongly Bearish |
| -60 ~ -20  | 🟠 `sell`        | Bearish |
| -20 ~ +20  | 🟡 `neutral`     | Neutral |
| +20 ~ +60  | 🟢 `buy`         | Bullish |
| +60 ~ +100 | 🟢 `strong_buy`  | Strongly Bullish |

### 22 Quantifiable Factors

The system includes 22 pre-configured analysis factors across 5 categories, each with an independent data source:

| Category | Factors | Data Sources |
|---|---|---|
| Macro | 5 | FRED API, Yahoo Finance |
| Policy | 4 | News Scraper, SEC RSS |
| Supply & Demand | 4 | CryptoQuant, Whale Alert, Blockchain.com |
| Sentiment | 4 | Alternative.me, LunarCrush, Google Trends |
| Technical | 5 | Calculated locally |

### Per-coin Configuration

Different cryptocurrencies (e.g., BTC vs ETH) can have different factor weights and boost coefficients via the `coin_factor_overrides` table. Global factors share base configuration but can be overridden at the coin level.

---

## 🚀 Quick Start

### Prerequisites

- Docker 24+ & Docker Compose v2
- Node.js 20+ (frontend dev)
- Python 3.11+ (analysis dev)
- Go 1.22+ (trading dev)
- Flutter 3.22+ (mobile dev)

### One-click Start

```bash
# Clone the repository
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up -d

# Access
# Web UI:       http://localhost
# Analysis API: http://localhost:8000/docs
# Trading API:  http://localhost:8001/api/v1/trading/
```

### Reinstall

```bash
# Stop and remove all containers, networks and volumes, then rebuild and start
docker compose down -v
docker compose up -d --build
```

### Uninstall

```bash
# Stop and remove all containers, networks and volumes
docker compose down -v

# To also remove all built images
docker compose down -v --rmi all
```

### Development Mode

```bash
# Frontend development
cd frontend
npm install
npm run dev          # http://localhost:5173

# Analysis service
cd backend/analysis
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Trading service
cd backend/trading
go mod tidy
go run main.go       # http://localhost:8001

# Flutter mobile app
cd app
flutter pub get
flutter run

# Mini program
cd miniprogram
npm install
npm run dev:weapp    # WeChat Mini Program
npm run dev:h5       # H5 web version
```

---

## 📁 Project Structure

```
cryptohub/
├── frontend/                   # React Web Frontend
│   ├── src/
│   │   ├── components/         # Reusable components (Layout, Charts, Common)
│   │   ├── pages/              # Pages (Dashboard, Market, Trading, Profile, Settings)
│   │   ├── store/              # Zustand state management
│   │   ├── api/                # API layer
│   │   ├── i18n/               # Internationalization (zh-CN, en-US)
│   │   └── styles/             # Themes and global styles
│   └── Dockerfile
│
├── backend/
│   ├── analysis/               # Python FastAPI Analysis Service
│   │   ├── app/
│   │   │   ├── api/            # API routes (auth, dashboard, analysis, settings)
│   │   │   ├── models/         # SQLAlchemy data models
│   │   │   ├── schemas/        # Pydantic request/response models
│   │   │   ├── services/       # Core services (trend_engine, technical, sentiment, market_data)
│   │   │   └── core/           # Infrastructure (database, redis, security)
│   │   └── Dockerfile
│   │
│   └── trading/                # Go Gin Trading Service
│       ├── internal/
│       │   ├── handlers/       # HTTP handlers
│       │   ├── services/       # Trading engine, backtesting, risk control, exchange clients
│       │   ├── middleware/     # Auth, CORS, rate limiting
│       │   └── ws/             # WebSocket real-time push
│       └── Dockerfile
│
├── app/                        # Flutter Mobile App
│   └── lib/
│       ├── screens/            # Screens (dashboard, market, trading, profile)
│       ├── providers/          # Riverpod state management
│       ├── services/           # API and WebSocket services
│       └── widgets/            # Reusable widgets
│
├── miniprogram/                # Taro Mini Program (WeChat/Douyin/H5)
│   └── src/
│       ├── pages/              # Pages
│       ├── components/         # Components
│       └── api/                # API layer
│
├── database/
│   └── migrations/             # SQL database migration scripts
│
├── docker/
│   └── nginx/                  # Nginx reverse proxy configuration
│
├── docs/
│   ├── zh/                     # Chinese documentation
│   └── en/                     # English documentation
├── docker-compose.yml          # Container orchestration
└── .env.example                # Environment variable template
```

---

## 📡 API Documentation

### Analysis Service (Port 8000)

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/dashboard/overview` | Dashboard overview |
| GET | `/api/v1/dashboard/market-summary` | Market summary |
| GET | `/api/v1/dashboard/recent-trades` | Recent trades |
| GET | `/api/v1/dashboard/strategy-status` | Strategy status |
| GET | `/api/v1/analysis/trend/{symbol}` | Get trend report |
| POST | `/api/v1/analysis/trend/{symbol}/generate` | Generate trend report |
| GET | `/api/v1/analysis/factors` | List factors |
| PUT | `/api/v1/analysis/factors/{id}` | Update factor |
| GET | `/api/v1/analysis/reports` | List reports |
| GET/PUT | `/api/v1/settings/profile` | User profile |
| GET/PUT | `/api/v1/settings/factors/{id}` | Factor settings |
| GET/PUT | `/api/v1/settings/coins/{symbol}/factors/{id}` | Coin factor overrides |

### Trading Service (Port 8001)

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/v1/trading/strategies/` | List/Create strategies |
| GET/PUT/DELETE | `/api/v1/trading/strategies/:id` | Strategy CRUD |
| POST | `/api/v1/trading/strategies/:id/start` | Start strategy |
| POST | `/api/v1/trading/strategies/:id/stop` | Stop strategy |
| POST | `/api/v1/trading/orders/` | Place order |
| GET | `/api/v1/trading/orders/` | List orders |
| DELETE | `/api/v1/trading/orders/:id` | Cancel order |
| POST | `/api/v1/trading/backtest/` | Run backtest |
| GET | `/api/v1/trading/backtest/:id` | Backtest results |
| GET/POST | `/api/v1/trading/portfolios/` | Portfolio management |
| WS | `/ws/` | Real-time WebSocket |

---

## 🌐 i18n

The platform supports Chinese/English switching across all clients (Web, App, Mini Program):

| Code | Language |
|---|---|
| `zh-CN` | Simplified Chinese |
| `en-US` | English (US) |

Implementation per platform:

| Platform | Solution |
|---|---|
| Web (React) | `react-i18next` with JSON translation files |
| Flutter | Custom `Translations` map + `LocaleProvider` |
| Taro | Custom `t()` function with language maps |

---

## 🎨 Theming

Three theme modes supported:

| Mode | Description |
|---|---|
| 🌙 Dark | Dark mode (default), Binance-style |
| ☀️ Light | Light mode |
| 🔄 Auto | Follow system preference |

### Color Palette

| Usage | Dark Mode | Light Mode |
|---|---|---|
| Background | `#0B0E11` | `#FAFAFA` |
| Card | `#1E2329` | `#FFFFFF` |
| Primary | `#F0B90B` (Gold) | `#F0B90B` |
| Positive | `#0ECB81` (Green) | `#0ECB81` |
| Negative | `#F6465D` (Red) | `#F6465D` |
| Text | `#EAECEF` | `#1E2329` |

---

## 🚢 Deployment

### Docker Production Deployment

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env to change passwords and secrets

# 2. Build and start
docker compose up -d --build

# 3. Check service status
docker compose ps

# 4. View logs
docker compose logs -f analysis
docker compose logs -f trading
```

### Service Ports

| Service | Port | Description |
|---|---|---|
| Nginx | 80, 443 | Reverse proxy |
| Frontend | 3000 | Web frontend |
| Analysis API | 8000 | Analysis service |
| Trading API | 8001 | Trading service |
| PostgreSQL | 5432 | Relational database |
| Redis | 6379 | Cache |
| InfluxDB | 8086 | Time-series database |
| Kafka | 9092 | Message queue |

---

## 🤝 Contributing

We welcome Issues and Pull Requests!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the CryptoHub Team
</p>
