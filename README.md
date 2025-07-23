# 📝 Bulk DOCX to PDF Converter

This is a lightweight, containerized web service that converts batches of `.docx` files into `.pdf`. You upload your files through a simple REST API, and once the job is done, you get a ZIP file with all your converted PDFs.

It’s built for **speed**, **reliability**, and **scalability**, so it can handle large numbers of files without breaking a sweat.

---

## ⚙️ Tech Stack

- **FastAPI** – Web API
- **Celery** – Background task processing
- **RabbitMQ** – Task queue
- **PostgreSQL** – Job tracking database
- **LibreOffice CLI** – File conversion engine
- **Docker + Docker Compose** – Easy deployment and containerization

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/docx-to-pdf-converter.git
cd docx-to-pdf-converter
```

---

### 2. Run the App with Docker Compose

Make sure you have Docker and Docker Compose installed. Then run:

```bash
docker-compose up --build
```

The first build might take a few minutes as it installs LibreOffice inside the worker container.

---

### 3. Access the Service

Once everything is up and running:

- The API will be available at: **http://localhost:8000**
- RabbitMQ dashboard (optional): **http://localhost:15672**

---

## 📤 How to Use the API

### 1. Submit a Conversion Job

Use `curl` or any API client like Postman to upload your `.docx` files:

```bash
curl -X POST http://localhost:8000/api/v1/jobs   -F "files=@/path/to/file1.docx"   -F "files=@/path/to/file2.docx"
```

You’ll get a response with a `job_id` to track the conversion.

---

### 2. Check Job Status

Use the `job_id` from the upload step:

```bash
curl http://localhost:8000/api/v1/jobs/<job_id>
```

Once the status says `COMPLETED`, you’ll see a download link in the response.

---

### 3. Download the Converted Files

Grab your results as a zip file:

```bash
curl http://localhost:8000/api/v1/jobs/<job_id>/download --output results.zip
```

The converted files will be saved as a zip file in the current terminal directory.

---

## 🛑 Stopping the App

To shut down the service:

```bash
docker-compose down
```

To also remove volumes (clears uploaded and converted files):

```bash
docker-compose down -v
```

---

## ✅ That’s It!

You now have a fully working DOCX-to-PDF batch converter running locally. Fast, simple, and ready to scale.