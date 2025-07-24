# 📝 Bulk DOCX to PDF Converter

This is a lightweight, containerized web service that converts batches of `.docx` files into `.pdf`. Upload files via a simple REST API, and receive a ZIP file of the converted PDFs.

Built for **speed**, **reliability**, and **scalability**.

---

## ⚙️ Tech Stack

- **FastAPI** – REST API
- **Celery** – Background task management
- **RabbitMQ** – Task queue
- **PostgreSQL** – Tracks jobs and statuses
- **LibreOffice CLI** – Performs DOCX to PDF conversion
- **Docker + Docker Compose** – For easy deployment

---

## 🧱 Architecture & File Storage

- **FastAPI container** handles API endpoints and file uploads.
- Uploaded `.docx` files are stored in a **shared Docker volume** accessible by both the **API** and **Celery worker** containers.
- The **worker container** picks up uploaded files from the shared volume, performs the conversion using **LibreOffice**, and writes the output PDFs back into the same volume.
- Converted files are zipped and served back to the user from the API container.

➡️ This design ensures **isolation of concerns** while maintaining **shared access** via volumes — enabling **scalable, parallel processing**.

---

## 🚀 Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/docx-to-pdf-converter.git
cd docx-to-pdf-converter
```

---

### 2. Build and Run the Containers

Ensure Docker & Docker Compose are installed:

```bash
docker-compose up --build
```

The first build may take a few minutes (LibreOffice installation in worker container).

---

### 3. Access the Services

- API docs: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- API root: [http://localhost:8000](http://localhost:8000)
- RabbitMQ dashboard: [http://localhost:15672](http://localhost:15672)

---

## 📡 Hosted Version

Also available at:

- **API root**: [http://docx-pdf.duckdns.org:8000](http://docx-pdf.duckdns.org:8000)
- Example `curl` usage:

```bash
curl -X POST http://docx-pdf.duckdns.org:8000/api/v1/jobs \
  -F "files=@/path/to/file1.docx" \
  -F "files=@/path/to/file2.docx"
```

---

## 📤 API Usage

### 1. Submit a Conversion Job

```bash
curl -X POST http://localhost:8000/api/v1/jobs \
  -F "files=@/path/to/file1.docx" \
  -F "files=@/path/to/file2.docx"
```

📨 Response:
```json
{ "job_id": "abc123" }
```

---

### 2. Check Job Status

```bash
curl http://localhost:8000/api/v1/jobs/<job_id>
```

Response shows `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, etc.) and download URL if ready.

---

### 3. Download Results

```bash
curl http://localhost:8000/api/v1/jobs/<job_id>/download --output results.zip
```

---

## 📚 API Docs

Swagger UI is automatically available at:

```
http://localhost:8000/docs
http://docx-pdf.duckdns.org:8000/docs
```

Includes schema, request/response formats, and live testing.

---

## 🛑 Stopping the App

```bash
docker-compose down        # Stop services
docker-compose down -v     # Also remove volumes (clears file data)
```

---

## ✅ Done!

You now have a fully functional, scalable, DOCX-to-PDF converter—locally and remotely accessible.
