# CryptoHub

[![Frontend CI](https://github.com/cryptohub/cryptohub/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/cryptohub/cryptohub/actions/workflows/frontend-ci.yml)
[![Go CI](https://github.com/cryptohub/cryptohub/actions/workflows/go-ci.yml/badge.svg)](https://github.com/cryptohub/cryptohub/actions/workflows/go-ci.yml)
[![Python CI](https://github.com/cryptohub/cryptohub/actions/workflows/python-ci.yml/badge.svg)](https://github.com/cryptohub/cryptohub/actions/workflows/python-ci.yml)
[![Flutter CI](https://github.com/cryptohub/cryptohub/actions/workflows/flutter-ci.yml/badge.svg)](https://github.com/cryptohub/cryptohub/actions/workflows/flutter-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Enterprise-grade cryptocurrency trend analysis and automated trading platform powered by multi-factor AI models, real-time market data, and a polyglot microservices architecture.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CryptoHub Platform                             │
│                                                                         │
│  ┌──────────────┐   ┌───────────────────────────────────────────────┐   │
│  │   Frontend   │   │               Mobile Apps                     │   │
│  │  React/Vite  │   │   Flutter (iOS / Android / Desktop)           │   │
│  │   port 3000  │   └───────────────────────────────────────────────┘   │
│  └──────┬───────┘                        │                              │
│         │                HTTPS / WSS     │                              │
│  ───────┴────────────────────────────────┴──────────────────────────    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       API Gateway  :8080                         │   │
│  │           JWT auth · rate limit · request routing                │   │
│  └──┬───────┬────────┬────────┬────────┬────────┬──────────────────┘   │
│     │       │        │        │        │        │                       │
│  ┌──▼──┐ ┌──▼──┐ ┌───▼──┐ ┌──▼───┐ ┌──▼──┐ ┌──▼─────────┐            │
│  │Trade│ │ WS  │ │Order │ │Risk  │ │Auth │ │Exchange    │            │
│  │Engn │ │ GW  │ │ Svc  │ │ Svc  │ │ Svc │ │  Proxy     │            │
│  │:8081│ │:8082│ │:8083 │ │:8084 │ │:8085│ │  :8086     │            │
│  └──┬──┘ └──┬──┘ └──┬───┘ └──┬───┘ └─────┘ └──┬─────────┘            │
│     │       │        │        │                  │                      │
│  ───┴───────┴────────┴────────┴──────────────────┴───────────────────  │
│                          NATS  :4222  (event bus)                       │
│  ───────────────────────────────────────────────────────────────────    │
│     │              │              │              │                      │
│  ┌──▼──────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼────────┐             │
│  │  Trend  │  │  Data    │  │ Backtest │  │ Sentiment   │             │
│  │ Engine  │  │Collector │  │  Engine  │  │  Analyzer   │             │
│  │ :8100   │  │  :8101   │  │  :8102   │  │   :8103     │             │
│  └─────────┘  └──────────┘  └──────────┘  └─────────────┘             │
│        Python · FastAPI · scikit-learn · TA-Lib · Transformers          │
│                                                                         │
│  ┌─────────────────────┐   ┌───────────────┐   ┌────────────────────┐  │
│  │  TimescaleDB / PG   │   │  Redis  :6379 │   │  NATS JetStream    │  │
│  │      :5432          │   │  cache+pubsub │   │     streaming      │  │
│  └─────────────────────┘   └───────────────┘   └────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Web Frontend** | React 18, TypeScript, Vite, Ant Design 5, TradingView Lightweight Charts, i18next |
| **Mobile** | Flutter 3, Dart, BLoC state management, fl_chart |
| **API Gateway** | Go 1.22, Gin, JWT, gRPC-gateway |
| **Go Services** | Go 1.22, gRPC, NATS, GORM, TimescaleDB |
| **Python Services** | Python 3.11, FastAPI, scikit-learn, TA-Lib, Transformers, pandas |
| **Database** | TimescaleDB (PostgreSQL 15) with hypertables for OHLCV |
| **Cache / PubSub** | Redis 7 (data cache + pub/sub + session store) |
| **Message Bus** | NATS 2 JetStream (event sourcing, order flow) |
| **Container** | Docker, docker compose, multi-stage builds |
| **CI/CD** | GitHub Actions (per-service pipelines + unified deploy) |
| **Observability** | OpenTelemetry, Prometheus, Grafana |
| **IaC** | Terraform (AWS EKS + RDS + ElastiCache) |

---

## Modules

### 📊 Dashboard
Real-time portfolio overview with total asset value, unrealised P&L, allocation pie charts, live market ticker, recent trade history, and active strategy cards. Connects to the WebSocket gateway for sub-100 ms price streaming.

### 📈 Market Analysis
AI-powered trend analysis engine delivering a composite trend score (0-100) built from six factor groups: **Macro** (Fed rate, DXY, SPX correlation), **Policy** (regulatory news NLP), **Supply/Demand** (on-chain metrics via Glassnode), **Market Sentiment** (Fear & Greed, social volume), **Technical Indicators** (RSI, MACD, BB, EMA ribbons), and **Capital Flow** (exchange net-flow, whale alerts). Users can adjust factor weights and view model explanations.

### ⚡ Trading
Strategy builder supporting grid, DCA, momentum, and mean-reversion templates. Integrates with exchange connectors (Binance, OKX, Bybit, Coinbase) via the exchange proxy. Includes paper-trading mode, backtesting with OHLCV data from TimescaleDB, and real-time position management with configurable stop-loss/take-profit.

### 👤 Profile
User account management: personal info, security settings (2FA, session tokens), exchange API key vault (AES-256 encrypted at rest), subscription tier management, and referral tracking.

### ⚙️ Settings
Customise the AI model configuration: enable/disable factor groups, fine-tune sub-factor weights via sliders, select data sources, configure notification channels (email, Telegram, Discord webhooks), and manage risk parameters (max drawdown, position size limits, daily loss limits).

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/cryptohub/cryptohub.git
cd cryptohub

# Copy environment template
cp .env.example .env
# Edit .env with your exchange API keys and secrets

# Start the full platform
docker compose up
```

Open **http://localhost:3000** in your browser.

---

## Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Docker + Compose | 24+ |
| Go | 1.22+ |
| Python | 3.11+ |
| Node.js | 20 LTS |
| Flutter | 3.22+ |
| Protocol Buffers | 3+ (`protoc`) |

### macOS

```bash
brew install go python@3.11 node flutter protobuf buf
brew install --cask docker
make setup
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update && sudo apt install -y golang-go python3.11 python3.11-venv nodejs npm protobuf-compiler
# Install Docker: https://docs.docker.com/engine/install/ubuntu/
make setup
```

### Windows (WSL2)

```powershell
# Inside WSL2 Ubuntu shell — same as Linux instructions above
wsl --install -d Ubuntu
```

### First-time setup

```bash
make setup       # install all dependencies
make migrate     # run database migrations
make seed        # seed development data
make dev         # start all services in watch mode
```

---

## Makefile Targets

```
make setup           Install all toolchain dependencies
make dev             Start all services in development mode
make build           Build all service binaries
make test            Run full test suite
make lint            Lint all services
make docker-up       docker compose up -d
make docker-down     docker compose down
make docker-build    Build all Docker images
make migrate         Run DB migrations (golang-migrate)
make seed            Seed dev data
make proto           Generate gRPC/protobuf stubs
make clean           Remove build artefacts
make frontend-dev    Vite dev server (port 3000)
make backend-go-dev  Air hot-reload for Go services
make backend-python-dev  Uvicorn reload for Python services
make app-android     flutter build apk
make app-ios         flutter build ipa
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_URL` | `postgres://cryptohub:secret@localhost:5432/cryptohub` | TimescaleDB connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `NATS_URL` | `nats://localhost:4222` | NATS server URL |
| `JWT_SECRET` | — | HS256 JWT signing secret (min 32 chars) |
| `JWT_EXPIRY` | `24h` | JWT access token TTL |
| `BINANCE_API_KEY` | — | Binance exchange API key |
| `BINANCE_SECRET` | — | Binance exchange API secret |
| `OKX_API_KEY` | — | OKX exchange API key |
| `OKX_SECRET` | — | OKX exchange API secret |
| `COINGECKO_API_KEY` | — | CoinGecko Pro API key |
| `GLASSNODE_API_KEY` | — | Glassnode on-chain data key |
| `OPENAI_API_KEY` | — | OpenAI key for sentiment NLP |
| `ENCRYPTION_KEY` | — | AES-256 key for API key vault |
| `LOG_LEVEL` | `info` | Log level (debug/info/warn/error) |
| `ENVIRONMENT` | `development` | Environment tag |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `git commit -m "feat(trading): add grid strategy builder"`
4. Push and open a Pull Request against `main`
5. All CI checks must pass before merge

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for code style, test requirements, and the review process.

---

## License

[MIT](LICENSE) © 2024 CryptoHub Team
Crypto Trending and Trading Platform
