# Deployment & Operations Guide

## 1. Prerequisites

### Production Environment

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 200 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Docker | 24.0+ | Latest stable |
| Docker Compose | v2.20+ | Latest stable |

### Development Environment

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Frontend dev |
| Python | 3.11+ | Analysis service |
| Go | 1.22+ | Trading service |
| Flutter | 3.22+ | Mobile app |
| PostgreSQL | 16 | Relational DB |
| Redis | 7 | Cache |

---

## 2. Quick Deployment

### 2.1 Docker Compose Deployment

```bash
# Step 1: Clone repository
git clone https://github.com/mugua/cryptohub.git
cd cryptohub

# Step 2: Configure environment
cp .env.example .env
# Edit passwords and secrets in .env

# Step 3: Start services
docker compose up -d

# Step 4: Check status
docker compose ps

# Step 5: View logs
docker compose logs -f
```

### 2.2 Service Access

| Service | URL | Description |
|---|---|---|
| Web UI | `http://localhost:8080` | Via Nginx reverse proxy |
| Analysis API Docs | `http://localhost:8000/docs` | FastAPI auto docs (Swagger) |
| Trading API | `http://localhost:8001` | Go/Gin service |
| InfluxDB Admin | `http://localhost:8086` | Time-series DB admin |

---

## 3. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `cryptohub` | DB username |
| `POSTGRES_PASSWORD` | `changeme` | DB password ⚠️ |
| `POSTGRES_DB` | `cryptohub` | DB name |
| `REDIS_PASSWORD` | `changeme` | Redis password ⚠️ |
| `INFLUX_USER` | `cryptohub` | InfluxDB username |
| `INFLUX_PASSWORD` | `changeme123` | InfluxDB password ⚠️ |
| `INFLUX_TOKEN` | `cryptohub-influx-token` | InfluxDB API Token ⚠️ |
| `SECRET_KEY` | `dev-secret-key...` | JWT signing key ⚠️ |

> ⚠️ **Security Warning**: Always change all default passwords and secrets in production!

---

## 4. Database Management

### 4.1 Initialization

Database migration scripts are located in `database/migrations/001_init.sql`, automatically executed on Docker startup.

### 4.2 Backup

```bash
# PostgreSQL backup
docker compose exec postgres pg_dump -U cryptohub cryptohub > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260408.sql | docker compose exec -T postgres psql -U cryptohub cryptohub

# Redis backup
docker compose exec redis redis-cli -a changeme BGSAVE
docker compose cp redis:/data/dump.rdb ./redis_backup.rdb
```

### 4.3 Schema Overview

| Table | Scale | Description |
|---|---|---|
| `users` | Thousands | User accounts |
| `exchange_api_keys` | Thousands | Encrypted exchange API keys |
| `analysis_factors` | 22 rows | Analysis factor config |
| `coin_factor_overrides` | Hundreds | Per-coin overrides |
| `trend_reports` | Tens of thousands | Trend reports |
| `strategies` | Thousands | Trading strategies |
| `orders` | Millions | Historical orders |
| `fund_flows` | Millions | Fund flow records |

---

## 5. Monitoring & Logging

### 5.1 Health Checks

```bash
# Analysis service
curl http://localhost:8000/health

# Check all container status
docker compose ps

# View resource usage
docker stats
```

### 5.2 Log Viewing

```bash
# View specific service logs
docker compose logs -f analysis    # Analysis service
docker compose logs -f trading     # Trading service
docker compose logs -f frontend    # Frontend service
docker compose logs -f postgres    # Database
docker compose logs -f kafka       # Message queue

# View last 100 lines
docker compose logs --tail=100 analysis
```

---

## 6. Troubleshooting

### Q1: Database connection failed

Check if PostgreSQL container is running and verify database configuration in `.env`.

```bash
docker compose logs postgres
docker compose exec postgres psql -U cryptohub -c "SELECT 1"
```

### Q2: Frontend cannot connect to API

Verify Nginx configuration is correct and backend services are running. Check Nginx logs.

```bash
docker compose logs nginx
curl http://localhost:8000/health
```

### Q3: Kafka fails to start

Kafka KRaft mode requires persistent storage. Clean and retry.

```bash
docker compose down -v  # Clean volumes
docker compose up -d
```

### Q4: Exchange API returns errors

Check API key permission settings. Ensure keys have trading permissions and IP whitelist is configured correctly.

---

## 7. Scaling

### 7.1 Horizontal Scaling

```bash
# Scale analysis service
docker compose up -d --scale analysis=3

# Scale trading service
docker compose up -d --scale trading=2
```

### 7.2 Production Recommendations

1. Use Kubernetes or Docker Swarm for container orchestration
2. Configure PostgreSQL primary-replica replication
3. Configure Redis Sentinel or Cluster mode
4. Configure multi-broker Kafka cluster
5. Enable HTTPS with TLS certificates
6. Set up log aggregation (ELK/Loki) and monitoring (Prometheus + Grafana)
