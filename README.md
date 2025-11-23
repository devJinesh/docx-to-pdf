# 📝 DOCX to PDF Converter

A lightweight, containerized web service that converts batches of `.docx` files into `.pdf` format. Upload files via REST API and receive a ZIP file of converted PDFs.

Built for **speed**, **reliability**, and **scalability**.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 2GB+ free disk space

### Run the Application
```bash
# Clone and start (first time: 5-15 minutes)
git clone <repository-url>
cd docx-to-pdf-converter
docker compose up --build -d

# Subsequent starts (10-15 seconds)
docker compose up -d
```

### Access Services
- **Frontend**: http://localhost:80
- **API Docs**: http://localhost:8000/docs
- **API**: http://localhost:8000

## 🧱 Architecture

- **FastAPI** - REST API with 4 workers
- **Celery** - Background task processing
- **RabbitMQ** - Message queue
- **PostgreSQL** - Job tracking & status
- **Redis** - Result backend
- **LibreOffice** - DOCX to PDF conversion
- **React + TypeScript** - Modern frontend

Files are processed asynchronously using shared Docker volumes for scalability.

## 📡 API Usage

### Submit Conversion Job
```bash
curl -X POST http://localhost:8000/api/v1/jobs \
  -F "files=@document1.docx" \
  -F "files=@document2.docx"
```

**Response:**
```json
{ "job_id": "abc123" }
```

### Check Job Status
```bash
curl http://localhost:8000/api/v1/jobs/abc123
```

### Download Results
```bash
curl http://localhost:8000/api/v1/jobs/abc123/download --output results.zip
```

## 🎨 Frontend Features

- Drag & drop file upload
- Real-time conversion progress
- Responsive design
- One-click download

## 🛑 Management

```bash
# Stop services
docker compose down

# Stop and remove data
docker compose down -v

# View logs
docker compose logs -f [service]
```

## 🔧 Configuration

Customize environment variables in `docker-compose.yml` or create a `.env` file using `.env.example` as template.

## 📚 Tech Stack Details

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, Pydantic
- **Worker**: Celery, LibreOffice with font optimization
- **Database**: PostgreSQL 17 with connection pooling
- **Queue**: RabbitMQ 3.13 with health checks
- **Cache**: Redis 7
