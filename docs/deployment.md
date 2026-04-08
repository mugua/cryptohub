# 部署与运维指南 / Deployment & Operations Guide

## 1. 环境要求 / Prerequisites

### 生产环境 / Production Environment

| 组件 / Component | 最低要求 / Minimum | 推荐配置 / Recommended |
|---|---|---|
| CPU | 4 核 / 4 cores | 8 核 / 8 cores |
| 内存 / RAM | 8 GB | 16 GB |
| 存储 / Storage | 50 GB SSD | 200 GB SSD |
| 操作系统 / OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.0+ | Latest stable |
| Docker Compose | v2.20+ | Latest stable |

### 开发环境 / Development Environment

| 工具 / Tool | 版本 / Version | 用途 / Purpose |
|---|---|---|
| Node.js | 20 LTS | 前端开发 / Frontend dev |
| Python | 3.11+ | 分析服务 / Analysis service |
| Go | 1.22+ | 交易服务 / Trading service |
| Flutter | 3.22+ | 移动端 / Mobile app |
| PostgreSQL | 16 | 关系数据库 / Relational DB |
| Redis | 7 | 缓存 / Cache |

---

## 2. 快速部署 / Quick Deployment

### 2.1 Docker Compose 部署 / Docker Compose Deployment

```bash
# 第一步：克隆代码 / Step 1: Clone repository
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# 第二步：配置环境变量 / Step 2: Configure environment
cp .env.example .env
# 修改 .env 中的密码和密钥 / Edit passwords and secrets in .env

# 第三步：启动服务 / Step 3: Start services
docker compose up -d

# 第四步：检查状态 / Step 4: Check status
docker compose ps

# 第五步：查看日志 / Step 5: View logs
docker compose logs -f
```

### 2.2 服务访问地址 / Service Access

| 服务 / Service | 地址 / URL | 说明 / Description |
|---|---|---|
| Web 界面 / Web UI | `http://localhost` | 通过 Nginx 反向代理 |
| 分析 API 文档 / Analysis API Docs | `http://localhost:8000/docs` | FastAPI 自动文档 / Swagger |
| 交易 API / Trading API | `http://localhost:8001` | Go/Gin 服务 |
| InfluxDB 管理 / InfluxDB Admin | `http://localhost:8086` | 时序数据库管理界面 |

---

## 3. 环境变量说明 / Environment Variables

| 变量 / Variable | 默认值 / Default | 说明 / Description |
|---|---|---|
| `POSTGRES_USER` | `cryptohub` | 数据库用户名 / DB username |
| `POSTGRES_PASSWORD` | `changeme` | 数据库密码 / DB password ⚠️ |
| `POSTGRES_DB` | `cryptohub` | 数据库名称 / DB name |
| `REDIS_PASSWORD` | `changeme` | Redis 密码 / Redis password ⚠️ |
| `INFLUX_USER` | `cryptohub` | InfluxDB 用户名 |
| `INFLUX_PASSWORD` | `changeme123` | InfluxDB 密码 ⚠️ |
| `INFLUX_TOKEN` | `cryptohub-influx-token` | InfluxDB API Token ⚠️ |
| `SECRET_KEY` | `dev-secret-key...` | JWT 签名密钥 ⚠️ |

> ⚠️ **安全提醒 / Security Warning**: 生产环境务必修改所有默认密码和密钥！/ Always change all default passwords and secrets in production!

---

## 4. 数据库管理 / Database Management

### 4.1 初始化 / Initialization

数据库迁移脚本位于 `database/migrations/001_init.sql`，Docker 启动时自动执行。

Database migration scripts are located in `database/migrations/001_init.sql`, automatically executed on Docker startup.

### 4.2 备份 / Backup

```bash
# PostgreSQL 备份 / PostgreSQL backup
docker compose exec postgres pg_dump -U cryptohub cryptohub > backup_$(date +%Y%m%d).sql

# 恢复 / Restore
cat backup_20260408.sql | docker compose exec -T postgres psql -U cryptohub cryptohub

# Redis 备份 / Redis backup
docker compose exec redis redis-cli -a changeme BGSAVE
docker compose cp redis:/data/dump.rdb ./redis_backup.rdb
```

### 4.3 表结构概览 / Schema Overview

| 表 / Table | 记录数级别 / Scale | 说明 / Description |
|---|---|---|
| `users` | 千级 / Thousands | 用户账户 / User accounts |
| `exchange_api_keys` | 千级 | 加密存储的交易所API密钥 / Encrypted exchange keys |
| `analysis_factors` | 22条 | 分析因子配置 / Analysis factor config |
| `coin_factor_overrides` | 百级 | 币种因子覆盖 / Per-coin overrides |
| `trend_reports` | 万级 / Tens of thousands | 趋势分析报告 / Trend reports |
| `strategies` | 千级 | 交易策略 / Trading strategies |
| `orders` | 百万级 / Millions | 历史订单 / Historical orders |
| `fund_flows` | 百万级 | 资金流水 / Fund flow records |

---

## 5. 监控与日志 / Monitoring & Logging

### 5.1 服务健康检查 / Health Checks

```bash
# 分析服务 / Analysis service
curl http://localhost:8000/health

# 检查所有容器状态 / Check all container status
docker compose ps

# 查看资源使用 / View resource usage
docker stats
```

### 5.2 日志查看 / Log Viewing

```bash
# 查看特定服务日志 / View specific service logs
docker compose logs -f analysis    # 分析服务
docker compose logs -f trading     # 交易服务
docker compose logs -f frontend    # 前端服务
docker compose logs -f postgres    # 数据库
docker compose logs -f kafka       # 消息队列

# 查看最近100行 / View last 100 lines
docker compose logs --tail=100 analysis
```

---

## 6. 常见问题 / Troubleshooting

### Q1: 数据库连接失败 / Database connection failed

**中文：** 检查 PostgreSQL 容器是否正常运行，以及 `.env` 中的数据库配置是否正确。

**English:** Check if PostgreSQL container is running and verify database configuration in `.env`.

```bash
docker compose logs postgres
docker compose exec postgres psql -U cryptohub -c "SELECT 1"
```

### Q2: 前端无法连接 API / Frontend cannot connect to API

**中文：** 确认 Nginx 配置正确，且后端服务已启动。检查 Nginx 日志。

**English:** Verify Nginx configuration is correct and backend services are running. Check Nginx logs.

```bash
docker compose logs nginx
curl http://localhost:8000/health
```

### Q3: Kafka 无法启动 / Kafka fails to start

**中文：** Kafka KRaft 模式需要持久化存储。清理后重试。

**English:** Kafka KRaft mode requires persistent storage. Clean and retry.

```bash
docker compose down -v  # 清理卷 / Clean volumes
docker compose up -d
```

### Q4: 交易所 API 返回错误 / Exchange API returns errors

**中文：** 检查 API 密钥权限设置。确保密钥有交易权限，且 IP 白名单配置正确。

**English:** Check API key permission settings. Ensure keys have trading permissions and IP whitelist is configured correctly.

---

## 7. 扩展部署 / Scaling

### 7.1 水平扩展 / Horizontal Scaling

```bash
# 扩展分析服务实例 / Scale analysis service
docker compose up -d --scale analysis=3

# 扩展交易服务实例 / Scale trading service
docker compose up -d --scale trading=2
```

### 7.2 生产级部署建议 / Production Recommendations

**中文：**
1. 使用 Kubernetes 或 Docker Swarm 进行容器编排
2. PostgreSQL 配置主从复制
3. Redis 配置 Sentinel 或 Cluster 模式
4. Kafka 配置多 Broker 集群
5. 使用 HTTPS 并配置 TLS 证书
6. 配置日志聚合（ELK/Loki）和监控（Prometheus + Grafana）

**English:**
1. Use Kubernetes or Docker Swarm for container orchestration
2. Configure PostgreSQL primary-replica replication
3. Configure Redis Sentinel or Cluster mode
4. Configure multi-broker Kafka cluster
5. Enable HTTPS with TLS certificates
6. Set up log aggregation (ELK/Loki) and monitoring (Prometheus + Grafana)
