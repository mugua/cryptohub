# CryptoHub — 加密货币量化交易平台

> 一站式加密货币量化交易平台，覆盖前端、后端、APP 及小程序。

---

## 系统架构

```
cryptohub/
├── frontend/          React + TypeScript + Vite (Web 端)
├── backend/
│   ├── go-core/       Go + Gin (核心交易引擎)
│   └── python-analysis/ Python + FastAPI (策略 / 分析服务)
├── app/               Flutter (Android & iOS)
├── miniprogram/       uni-app (微信 / 抖音小程序)
└── docker-compose.yml
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 📊 仪表盘 | 资产总览、持仓盈亏、实时行情、策略状态 |
| 📈 市场分析 | 宏观经济、政策法规、供需分析、市场情绪、技术分析五维深度报告 |
| 🤖 量化交易 | 10+ 种策略模板、策略管理、回测引擎、资金曲线 |
| 👤 个人中心 | 多交易所 API 管理（Binance/OKX/Bybit 等）、订单历史 |
| ⚙️ 系统设置 | 通用设置、通知配置、风控参数 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 · TypeScript · Vite · Ant Design · Recharts |
| 后端（交易） | Go 1.24 · Gin · WebSocket · gorilla/websocket |
| 后端（分析） | Python 3.12 · FastAPI · Uvicorn · Pandas · NumPy |
| APP | Flutter 3.x · Riverpod · go_router · fl_chart |
| 小程序 | uni-app · Vue 3 · Pinia |
| 数据库 | PostgreSQL 16 · Redis 7 · InfluxDB 2.7 |
| 消息队列 | Apache Kafka |
| 部署 | Docker · Docker Compose · Nginx |

## 快速开始

### 本地开发

```bash
# 拉取镜像
git clone https://github.com/mugua/cryptohub.git

# 启动所有基础服务（数据库、Redis、Kafka）
docker-compose up -d postgres redis influxdb kafka

# 前端
cd frontend && npm install && npm run dev

# Go 核心服务
cd backend/go-core && go run ./cmd/server

# Python 分析服务
cd backend/python-analysis
pip install -r requirements.txt
python3 main.py
```

### 全栈 Docker 部署

```bash
# 首次构建并启动（前台运行，Ctrl+C 停止）
docker-compose up --build

# 首次构建并后台启动（推荐）
docker-compose up --build -d
```

访问 `http://localhost:3000` 查看 Web 端。

### 运行与重启

```bash
# 后台启动所有服务（已构建过镜像时无需 --build）
docker-compose up -d

# 查看所有服务运行状态
docker-compose ps

# 查看服务日志（实时跟踪）
docker-compose logs -f

# 查看指定服务日志
docker-compose logs -f frontend

# 重启所有服务
docker-compose restart

# 重启指定服务
docker-compose restart frontend

# 停止所有服务（不删除容器）
docker-compose stop

# 停止并删除所有容器（保留数据卷）
docker-compose down

# 停止并删除所有容器及数据卷（⚠️ 数据会丢失）
docker-compose down -v

# 重新构建并启动（代码更新后使用）
docker-compose up --build -d
```

> **提示：** 所有服务均已配置 `restart: unless-stopped`，服务器重启后 Docker 会自动拉起所有容器，无需手动操作。如果服务未自动恢复，请确认 Docker 服务已设置开机自启：
>
> ```bash
> sudo systemctl enable docker
> ```

## API 文档

- Go 核心服务：`http://localhost:8080/health`
- Python 分析服务：`http://localhost:8001/docs`（Swagger UI）

## 支持的交易所

Binance · OKX · Bybit · Coinbase · Kraken · Gate.io · Huobi

## 支持的量化策略

网格交易 · DCA 定投 · 动量策略 · 均值回归 · 套利 ·
MACD 金叉/死叉 · RSI 反转 · 布林带 · 海龟交易 · 自定义策略
