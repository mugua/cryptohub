# CryptoHub · 加密货币趋势分析与量化交易平台

<p align="center">
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

> **[English Documentation](README.md)**

---

## 📖 目录

- [项目简介](#-项目简介)
- [系统架构](#-系统架构)
- [技术栈](#-技术栈)
- [功能模块](#-功能模块)
- [趋势分析引擎](#-趋势分析引擎)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [API 文档](#-api-文档)
- [多语言支持](#-多语言支持)
- [主题切换](#-主题切换)
- [部署指南](#-部署指南)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🌟 项目简介

CryptoHub 是一个企业级全栈加密货币趋势分析与量化交易平台。平台通过整合宏观经济、政策法规、市场供需、市场情绪和技术分析五大维度的量化因子，基于可配置的权重和动态增强系数，生成精准的趋势分析报告。同时支持多交易所API集成（Binance、OKX等），提供量化交易、策略交易、手动交易等多种交易方式。

---

## 🏗 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (反向代理)                           │
├──────────┬──────────────────────────┬───────────────────────────┤
│ Frontend │   Analysis Service       │   Trading Service         │
│ React+TS │   Python / FastAPI       │   Go / Gin                │
│ Vite     │   趋势分析引擎            │   交易执行引擎              │
│ Ant Design│                         │                           │
│ Port 3000│   Port 8000              │   Port 8001               │
├──────────┴──────────────────────────┴───────────────────────────┤
│                        Apache Kafka (消息队列)                    │
├─────────────────┬──────────────────┬────────────────────────────┤
│  PostgreSQL     │     Redis        │    InfluxDB                │
│  关系型数据      │     缓存/限流     │    时序行情数据              │
└─────────────────┴──────────────────┴────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     多端客户端                                    │
├────────────┬────────────┬────────────┬──────────────────────────┤
│   Web SPA  │  Flutter   │  微信小程序  │     抖音小程序              │
│   React    │  Android   │            │                          │
│            │  iOS       │            │                          │
│            │  HarmonyOS │            │                          │
└────────────┴────────────┴────────────┴──────────────────────────┘
```

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| **前端** | React 18 · TypeScript · Vite · Ant Design 5 · Recharts | SPA 单页应用，Binance 风格 UI |
| **后端-分析** | Python · FastAPI · Uvicorn · Pandas · NumPy | 趋势分析引擎，市场数据聚合 |
| **后端-交易** | Go · Gin · gorilla/websocket | 高性能交易引擎，实时 WebSocket |
| **移动端** | Flutter · Riverpod · go_router · fl_chart | Android / iOS / HarmonyOS |
| **小程序** | Taro 3 · React · TypeScript | 微信 / 抖音 / H5 |
| **数据库** | PostgreSQL 16 · Redis 7 · InfluxDB 2.7 | 关系型 + 缓存 + 时序 |
| **消息队列** | Apache Kafka 3.7 (KRaft) | 事件驱动架构 |
| **部署** | Docker · Docker Compose · Nginx | 容器化一键部署 |

---

## 📦 功能模块

### 1. 仪表盘
- **资产总览**: 总资产、24h盈亏、持仓分布
- **市场概况**: Top 加密货币实时行情
- **策略状态**: 运行中策略的实时状态
- **最近交易**: 最新交易记录
- **快速操作**: 一键买卖、创建策略、生成报告

### 2. 市场/趋势分析
- **宏观经济分析**: CPI、利率、美元指数、就业数据、M2货币供应
- **政策法规分析**: 美/中/欧加密政策、SEC执法
- **市场供需分析**: 交易所储备、巨鲸动向、算力、ETF资金流
- **市场情绪分析**: 恐惧贪婪指数、社交媒体、Google趋势、资金费率
- **技术层面分析**: RSI、MACD、布林带、MA200、成交量

### 3. 交易模块
- **策略管理**: 创建、编辑、启停策略
- **策略编辑器**: 自定义策略代码
- **回测系统**: 历史数据回测，夏普比率、最大回撤等指标
- **实盘交易**: 连接交易所真实下单
- **虚拟盘交易**: 模拟交易不花真钱
- **组合管理**: 多币种资产组合
- **风险管理**: 仓位限制、杠杆限制、日亏损限制

### 4. 个人中心
- **用户管理**: 注册、登录、个人信息
- **交易设置**: 各币种默认杠杆、止盈止损
- **API设置**: 对接 Binance、OKX 等交易所
- **资金流水**: 充值、提现、交易、手续费记录
- **订阅管理**: 免费版/专业版/企业版
- **通知偏好**: 邮件、短信、推送、微信通知

### 5. 系统设置
- **因子权重管理**: 调整分析因子权重
- **币种因子配置**: BTC/ETH 独立因子权重和增强系数
- **动态增强系数**: 重大事件时动态调整

---

## 🔬 趋势分析引擎

### 核心算法

```
最终得分 = Σ(factor_score × weight × boost_coefficient) / Σ(weight × boost_coefficient) × 100
```

| 参数 | 说明 | 范围 |
|---|---|---|
| `factor_score` | 单因子得分 | -100 ~ +100 |
| `weight` | 因子权重 | 0 ~ 1 (总和≈1) |
| `boost_coefficient` | 动态增强系数 | 0.1 ~ 5.0 (默认 1.0) |
| `final_score` | 综合趋势得分 | -100 ~ +100 |

### 趋势信号映射

| 得分范围 | 信号 | 含义 |
|---|---|---|
| -100 ~ -60 | 🔴 `strong_sell` | 强烈看跌 |
| -60 ~ -20  | 🟠 `sell`        | 看跌 |
| -20 ~ +20  | 🟡 `neutral`     | 中性 |
| +20 ~ +60  | 🟢 `buy`         | 看涨 |
| +60 ~ +100 | 🟢 `strong_buy`  | 强烈看涨 |

### 22 个量化因子

系统预设 22 个分析因子，分布在 5 大类别中，每个因子都有独立的数据源：

| 类别 | 因子数 | 数据源示例 |
|---|---|---|
| 宏观经济 | 5 | FRED API, Yahoo Finance |
| 政策法规 | 4 | News Scraper, SEC RSS |
| 供需分析 | 4 | CryptoQuant, Whale Alert, Blockchain.com |
| 市场情绪 | 4 | Alternative.me, LunarCrush, Google Trends |
| 技术分析 | 5 | 本地计算 |

### 币种独立配置

不同币种（如 BTC 和 ETH）可以有不同的因子权重和增强系数，通过 `coin_factor_overrides` 表实现。相同的全局因子共用基础配置，但可以在币种级别覆盖。

> 📖 详细文档请参阅 [趋势分析引擎技术文档](docs/zh/trend-analysis-engine.md)

---

## 🚀 快速开始

### 环境要求

- Docker 24+ & Docker Compose v2
- Node.js 20+ (前端开发)
- Python 3.11+ (分析服务开发)
- Go 1.22+ (交易服务开发)
- Flutter 3.22+ (移动端开发)

### 一键启动

```bash
# 克隆项目
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# 复制环境变量
cp .env.example .env

# 启动所有服务
docker compose up -d

# 访问
# Web UI:       http://localhost:8080
# Analysis API: http://localhost:8000/docs
# Trading API:  http://localhost:8001/api/v1/trading/
```

### 重装项目

```bash
# 停止并删除所有容器、网络和数据卷，然后重新构建并启动
docker compose down -v
docker compose up -d --build
```

### 卸载项目

```bash
# 停止并删除所有容器、网络和数据卷
docker compose down -v

# 如需同时删除所有已构建的镜像
docker compose down -v --rmi all
```

### 开发模式

```bash
# 前端开发
cd frontend
npm install
npm run dev          # http://localhost:5173

# 分析服务
cd backend/analysis
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 交易服务
cd backend/trading
go mod tidy
go run main.go       # http://localhost:8001

# Flutter 移动端
cd app
flutter pub get
flutter run

# 小程序
cd miniprogram
npm install
npm run dev:weapp    # 微信小程序
npm run dev:h5       # H5 网页版
```

---

## 📁 项目结构

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
├── docs/
│   ├── zh/                     # 中文文档
│   └── en/                     # 英文文档
├── docker-compose.yml          # 容器编排
└── .env.example                # 环境变量模板
```

---

## 📡 API 文档

### 分析服务 (Port 8000)

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/refresh` | 刷新令牌 |
| GET | `/api/v1/dashboard/overview` | 仪表盘概览 |
| GET | `/api/v1/dashboard/market-summary` | 市场概况 |
| GET | `/api/v1/dashboard/recent-trades` | 最近交易 |
| GET | `/api/v1/dashboard/strategy-status` | 策略状态 |
| GET | `/api/v1/analysis/trend/{symbol}` | 获取趋势报告 |
| POST | `/api/v1/analysis/trend/{symbol}/generate` | 生成趋势报告 |
| GET | `/api/v1/analysis/factors` | 分析因子列表 |
| PUT | `/api/v1/analysis/factors/{id}` | 更新因子 |
| GET | `/api/v1/analysis/reports` | 报告列表 |
| GET/PUT | `/api/v1/settings/profile` | 用户配置 |
| GET/PUT | `/api/v1/settings/factors/{id}` | 因子设置 |
| GET/PUT | `/api/v1/settings/coins/{symbol}/factors/{id}` | 币种因子覆盖 |

### 交易服务 (Port 8001)

| 方法 | 路径 | 说明 |
|---|---|---|
| GET/POST | `/api/v1/trading/strategies/` | 策略列表/创建 |
| GET/PUT/DELETE | `/api/v1/trading/strategies/:id` | 策略详情/更新/删除 |
| POST | `/api/v1/trading/strategies/:id/start` | 启动策略 |
| POST | `/api/v1/trading/strategies/:id/stop` | 停止策略 |
| POST | `/api/v1/trading/orders/` | 下单 |
| GET | `/api/v1/trading/orders/` | 订单列表 |
| DELETE | `/api/v1/trading/orders/:id` | 取消订单 |
| POST | `/api/v1/trading/backtest/` | 运行回测 |
| GET | `/api/v1/trading/backtest/:id` | 回测结果 |
| GET/POST | `/api/v1/trading/portfolios/` | 组合管理 |
| WS | `/ws/` | WebSocket 实时数据 |

---

## 🌐 多语言支持

平台支持中英文切换，所有端（Web、App、小程序）统一使用以下语言标识：

| 标识 | 语言 |
|---|---|
| `zh-CN` | 简体中文 |
| `en-US` | English (US) |

各端实现方式：

| 端 | 方案 |
|---|---|
| Web (React) | `react-i18next` + JSON 翻译文件 |
| Flutter | 自定义 `Translations` Map + `LocaleProvider` |
| Taro | 自定义 `t()` 函数 + 语言映射表 |

---

## 🎨 主题切换

支持三种主题模式：

| 模式 | 说明 |
|---|---|
| 🌙 深色 | 深色模式（默认），仿 Binance 风格 |
| ☀️ 浅色 | 浅色模式 |
| 🔄 自动 | 跟随系统设置 |

### 配色方案

| 用途 | 深色模式 | 浅色模式 |
|---|---|---|
| 背景 | `#0B0E11` | `#FAFAFA` |
| 卡片 | `#1E2329` | `#FFFFFF` |
| 主色 | `#F0B90B` (金色) | `#F0B90B` |
| 涨 | `#0ECB81` (绿色) | `#0ECB81` |
| 跌 | `#F6465D` (红色) | `#F6465D` |
| 文字 | `#EAECEF` | `#1E2329` |

---

## 🚢 部署指南

### Docker 生产部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 修改密码和密钥

# 2. 构建并启动
docker compose up -d --build

# 3. 检查服务状态
docker compose ps

# 4. 查看日志
docker compose logs -f analysis
docker compose logs -f trading
```

### 服务端口

| 服务 | 端口 | 说明 |
|---|---|---|
| Nginx | 8080, 8443 | 反向代理 |
| Frontend | 3000 | Web 前端 |
| Analysis API | 8000 | 分析服务 |
| Trading API | 8001 | 交易服务 |
| PostgreSQL | 5432 | 关系型数据库 |
| Redis | 6379 | 缓存 |
| InfluxDB | 8086 | 时序数据库 |
| Kafka | 9092 | 消息队列 |

> 📖 详细部署文档请参阅 [部署与运维指南](docs/zh/deployment.md)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 PR

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

<p align="center">
  由 CryptoHub 团队用 ❤️ 构建
</p>
