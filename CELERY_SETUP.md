# Celery + RabbitMQ + Redis Setup Guide

## Overview

This platform uses **Celery** with **RabbitMQ** as the message broker and **Redis** as the result backend to handle heavy document processing tasks asynchronously. This architecture provides:

- **Reliability**: Failed tasks are automatically retried
- **Scalability**: Multiple workers can process tasks in parallel
- **Performance**: Non-blocking API responses
- **Monitoring**: Real-time task tracking and queue statistics

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Django    │────▶│   RabbitMQ   │────▶│   Celery    │
│   Backend   │     │Message Broker│     │   Workers   │
└─────────────┘     └──────────────┘     └─────────────┘
      │                                          │
      │              ┌──────────────┐            │
      └─────────────▶│    Redis     │◀───────────┘
                     │Result Backend│
                     └──────────────┘
```

## Services

### 1. RabbitMQ (Message Broker)
- **Port**: 5672 (AMQP)
- **Management UI**: http://localhost:15672 (guest/guest)
- **Purpose**: Manages task queues and message routing

### 2. Redis (Result Backend)
- **Port**: 6379
- **Purpose**: Stores task results and states

### 3. Celery Worker
- **Concurrency**: 4 workers
- **Queues**: `pdf_processing`, `image_processing`, `data_processing`, `default`
- **Purpose**: Processes async tasks

### 4. Celery Beat
- **Purpose**: Schedules periodic tasks (cleanup, monitoring)

### 5. Flower (Optional)
- **Port**: http://localhost:5555
- **Purpose**: Real-time monitoring of Celery tasks
- **Start**: `docker-compose --profile monitoring up`

## Quick Start

### 1. Start All Services

```bash
# Start core services (DB, Redis, RabbitMQ, Backend, Workers)
docker-compose up -d

# Start with monitoring (includes Flower)
docker-compose --profile monitoring up -d

# View logs
docker-compose logs -f celery_worker
docker-compose logs -f rabbitmq
```

### 2. Verify Services

```bash
# Check all services are running
docker-compose ps

# Test RabbitMQ
curl http://localhost:15672/api/overview -u guest:guest

# Test Redis
docker-compose exec redis redis-cli ping

# Test Celery worker
docker-compose exec celery_worker celery -A core inspect active
```

## API Usage

### Synchronous vs Asynchronous Endpoints

**Synchronous** (blocking, for small files):
```
POST /api/pdf-tools/pdf-to-word/
POST /api/pdf-tools/word-to-pdf/
```

**Asynchronous** (non-blocking, for large files):
```
POST /api/pdf-tools/async/pdf-to-word/
POST /api/pdf-tools/async/word-to-pdf/
```

### Async Workflow

#### 1. Submit Task
```bash
curl -X POST http://localhost:8000/api/pdf-tools/async/pdf-to-word/ \
  -H "Content-Type: application/json" \
  -d '{"pdf": "base64_encoded_pdf_data"}'
```

**Response:**
```json
{
  "success": true,
  "task_id": "abc123-def456-789",
  "status": "processing",
  "message": "We are processing your request. Please wait...",
  "status_url": "/api/pdf-tools/task-status/abc123-def456-789/"
}
```

#### 2. Poll Task Status
```bash
curl http://localhost:8000/api/pdf-tools/task-status/abc123-def456-789/
```

**Response (In Progress):**
```json
{
  "task_id": "abc123-def456-789",
  "status": "STARTED",
  "message": "Processing your request...",
  "progress": 50
}
```

**Response (Complete):**
```json
{
  "task_id": "abc123-def456-789",
  "status": "SUCCESS",
  "message": "Processing complete! Your file is ready.",
  "progress": 100,
  "download_ready": true,
  "result": {
    "success": true,
    "docx": "base64_encoded_docx_data",
    "filename": "converted.docx",
    "size": 1024567
  }
}
```

#### 3. Download File
Use the `result.docx` base64 data from the completed task.

## Task Queues

Tasks are automatically routed to specialized queues:

| Queue | Task Types | Priority |
|-------|------------|----------|
| `pdf_processing` | PDF conversions, merging, splitting | High |
| `image_processing` | Image manipulation, OCR | Medium |
| `data_processing` | CSV/Excel analysis, transformations | Medium |
| `default` | General tasks | Low |

## Configuration

### Environment Variables

```bash
# RabbitMQ
CELERY_BROKER_URL=amqp://guest:guest@rabbitmq:5672//
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Redis
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Task Settings (in Django settings.py)
CELERY_TASK_TIME_LIMIT=1800  # 30 minutes hard limit
CELERY_TASK_SOFT_TIME_LIMIT=1500  # 25 minutes soft limit
CELERY_WORKER_PREFETCH_MULTIPLIER=1  # One task at a time per worker
CELERY_TASK_MAX_RETRIES=3  # Retry failed tasks 3 times
```

## Monitoring & Debugging

### 1. Flower Dashboard
```bash
docker-compose --profile monitoring up -d
open http://localhost:5555
```

Features:
- Real-time task monitoring
- Worker status and statistics
- Task history and results
- Task rate limiting

### 2. RabbitMQ Management
```bash
open http://localhost:15672
# Login: guest/guest
```

Features:
- Queue statistics
- Message rates
- Connection monitoring
- Exchange/routing visualization

### 3. Celery CLI Commands

```bash
# Check active tasks
docker-compose exec celery_worker celery -A core inspect active

# Check scheduled tasks
docker-compose exec celery_worker celery -A core inspect scheduled

# Check registered tasks
docker-compose exec celery_worker celery -A core inspect registered

# Purge all tasks from queue
docker-compose exec celery_worker celery -A core purge

# Get worker statistics
docker-compose exec celery_worker celery -A core inspect stats
```

## Performance Tuning

### Scaling Workers

```bash
# Scale to 3 worker instances
docker-compose up -d --scale celery_worker=3

# Each worker runs 4 concurrent tasks = 12 total
```

### Adjusting Concurrency

Edit `docker-compose.yml`:
```yaml
celery_worker:
  command: celery -A core worker --loglevel=info --concurrency=8  # 8 concurrent tasks
```

### Memory Optimization

```yaml
celery_worker:
  environment:
    - CELERY_WORKER_MAX_TASKS_PER_CHILD=100  # Restart after 100 tasks
  deploy:
    resources:
      limits:
        memory: 2G  # Max memory per worker
```

## Troubleshooting

### Workers Not Picking Up Tasks

1. Check RabbitMQ connection:
```bash
docker-compose logs rabbitmq
docker-compose logs celery_worker
```

2. Verify task routing:
```bash
docker-compose exec celery_worker celery -A core inspect active_queues
```

3. Restart workers:
```bash
docker-compose restart celery_worker
```

### Tasks Stuck in PENDING

- **Cause**: Worker crashed or task never reached queue
- **Solution**:
```bash
# Check worker status
docker-compose ps celery_worker

# Restart worker
docker-compose restart celery_worker
```

### High Memory Usage

- **Cause**: Too many concurrent tasks or memory leaks
- **Solution**:
  1. Reduce `CELERY_WORKER_PREFETCH_MULTIPLIER`
  2. Lower `--concurrency` setting
  3. Set `CELERY_WORKER_MAX_TASKS_PER_CHILD` to restart workers periodically

### Task Timeout

- **Cause**: Task exceeds time limit
- **Solution**: Increase time limits in `settings.py`:
```python
CELERY_TASK_TIME_LIMIT = 3600  # 1 hour
CELERY_TASK_SOFT_TIME_LIMIT = 3300  # 55 minutes
```

## Production Deployment

### 1. Security

```bash
# Change default credentials
RABBITMQ_USER=your_user
RABBITMQ_PASS=strong_password_here

# Use Redis password
CELERY_RESULT_BACKEND=redis://:password@redis:6379/0
```

### 2. Persistence

```yaml
rabbitmq:
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq  # Persists messages

redis:
  volumes:
    - redis_data:/data  # Persists results
  command: redis-server --appendonly yes  # Enable AOF persistence
```

### 3. High Availability

```yaml
# Multiple RabbitMQ nodes
rabbitmq_1:
  ...
rabbitmq_2:
  ...

# Load balancer for workers
celery_worker:
  deploy:
    replicas: 5
```

### 4. Monitoring

```bash
# Production monitoring
- Flower for Celery tasks
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
```

## Task Best Practices

1. **Idempotent Tasks**: Tasks should be safe to run multiple times
2. **Short Tasks**: Keep tasks under 30 minutes
3. **Progress Tracking**: Update task state for long-running operations
4. **Cleanup**: Delete old task results periodically (automated via Beat)
5. **Error Handling**: Always wrap in try/except with proper logging
6. **Retry Logic**: Use exponential backoff for retries

## Testing

```bash
# Test async endpoint
curl -X POST http://localhost:8000/api/pdf-tools/async/pdf-to-word/ \
  -H "Content-Type: application/json" \
  -d '{"pdf": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovQ3JlYXRvciAoVGVzdCkKPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKdHJhaWxlcgo8PAovU2l6ZSA1Cj4+CnN0YXJ0eHJlZgoxOTkKJSVFT0YK"}'

# Get task status
TASK_ID=<task_id_from_response>
curl http://localhost:8000/api/pdf-tools/task-status/$TASK_ID/

# Check queue health
curl http://localhost:8000/api/pdf-tools/queue-status/
```

## References

- [Celery Documentation](https://docs.celeryproject.org/)
- [RabbitMQ Management Guide](https://www.rabbitmq.com/management.html)
- [Redis Documentation](https://redis.io/documentation)
- [Flower Documentation](https://flower.readthedocs.io/)
