# 部署与运维指南

## 1. 环境要求

### 生产环境

| 组件 | 最低要求 | 推荐配置 |
|---|---|---|
| CPU | 4 核 | 8 核 |
| 内存 | 8 GB | 16 GB |
| 存储 | 50 GB SSD | 200 GB SSD |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.0+ | 最新稳定版 |
| Docker Compose | v2.20+ | 最新稳定版 |

### 开发环境

| 工具 | 版本 | 用途 |
|---|---|---|
| Node.js | 20 LTS | 前端开发 |
| Python | 3.11+ | 分析服务 |
| Go | 1.22+ | 交易服务 |
| Flutter | 3.22+ | 移动端 |
| PostgreSQL | 16 | 关系数据库 |
| Redis | 7 | 缓存 |

---

## 2. 快速部署

### 2.1 Docker Compose 部署

```bash
# 第一步：克隆代码
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# 第二步：配置环境变量
cp .env.example .env
# 修改 .env 中的密码和密钥

# 第三步：启动服务
docker compose up -d

# 第四步：检查状态
docker compose ps

# 第五步：查看日志
docker compose logs -f
```

### 2.2 服务访问地址

| 服务 | 地址 | 说明 |
|---|---|---|
| Web 界面 | `http://localhost:3000` | 前端服务 |
| 分析 API 文档 | `http://localhost:8000/docs` | FastAPI 自动文档 (Swagger) |
| 交易 API | `http://localhost:8001` | Go/Gin 服务 |
| InfluxDB 管理 | `http://localhost:8086` | 时序数据库管理界面 |

---

## 3. 环境变量说明

| 变量 | 默认值 | 说明 |
|---|---|---|
| `POSTGRES_USER` | `cryptohub` | 数据库用户名 |
| `POSTGRES_PASSWORD` | `changeme` | 数据库密码 ⚠️ |
| `POSTGRES_DB` | `cryptohub` | 数据库名称 |
| `REDIS_PASSWORD` | `changeme` | Redis 密码 ⚠️ |
| `INFLUX_USER` | `cryptohub` | InfluxDB 用户名 |
| `INFLUX_PASSWORD` | `changeme123` | InfluxDB 密码 ⚠️ |
| `INFLUX_TOKEN` | `cryptohub-influx-token` | InfluxDB API Token ⚠️ |
| `SECRET_KEY` | `dev-secret-key...` | JWT 签名密钥 ⚠️ |

> ⚠️ **安全提醒**: 生产环境务必修改所有默认密码和密钥！

---

## 4. 数据库管理

### 4.1 初始化

数据库迁移脚本位于 `database/migrations/001_init.sql`，Docker 启动时自动执行。

### 4.2 备份

```bash
# PostgreSQL 备份
docker compose exec postgres pg_dump -U cryptohub cryptohub > backup_$(date +%Y%m%d).sql

# 恢复
cat backup_20260408.sql | docker compose exec -T postgres psql -U cryptohub cryptohub

# Redis 备份
docker compose exec redis redis-cli -a changeme BGSAVE
docker compose cp redis:/data/dump.rdb ./redis_backup.rdb
```

### 4.3 表结构概览

| 表 | 记录数级别 | 说明 |
|---|---|---|
| `users` | 千级 | 用户账户 |
| `exchange_api_keys` | 千级 | 加密存储的交易所API密钥 |
| `analysis_factors` | 22条 | 分析因子配置 |
| `coin_factor_overrides` | 百级 | 币种因子覆盖 |
| `trend_reports` | 万级 | 趋势分析报告 |
| `strategies` | 千级 | 交易策略 |
| `orders` | 百万级 | 历史订单 |
| `fund_flows` | 百万级 | 资金流水 |

---

## 5. 监控与日志

### 5.1 服务健康检查

```bash
# 分析服务
curl http://localhost:8000/health

# 检查所有容器状态
docker compose ps

# 查看资源使用
docker stats
```

### 5.2 日志查看

```bash
# 查看特定服务日志
docker compose logs -f analysis    # 分析服务
docker compose logs -f trading     # 交易服务
docker compose logs -f frontend    # 前端服务
docker compose logs -f postgres    # 数据库
docker compose logs -f kafka       # 消息队列

# 查看最近100行
docker compose logs --tail=100 analysis
```

---

## 6. 常见问题

### Q1: 数据库连接失败

检查 PostgreSQL 容器是否正常运行，以及 `.env` 中的数据库配置是否正确。

```bash
docker compose logs postgres
docker compose exec postgres psql -U cryptohub -c "SELECT 1"
```

### Q2: 前端无法连接 API

确认后端服务已启动。检查服务日志。

```bash
docker compose logs frontend
curl http://localhost:8000/health
```

### Q3: Kafka 无法启动

Kafka KRaft 模式需要持久化存储。清理后重试。

```bash
docker compose down -v  # 清理卷
docker compose up -d
```

### Q4: 交易所 API 返回错误

检查 API 密钥权限设置。确保密钥有交易权限，且 IP 白名单配置正确。

---

## 7. 扩展部署

### 7.1 水平扩展

```bash
# 扩展分析服务实例
docker compose up -d --scale analysis=3

# 扩展交易服务实例
docker compose up -d --scale trading=2
```

### 7.2 生产级部署建议

1. 使用 Kubernetes 或 Docker Swarm 进行容器编排
2. PostgreSQL 配置主从复制
3. Redis 配置 Sentinel 或 Cluster 模式
4. Kafka 配置多 Broker 集群
5. 使用 HTTPS 并配置 TLS 证书
6. 配置日志聚合（ELK/Loki）和监控（Prometheus + Grafana）
