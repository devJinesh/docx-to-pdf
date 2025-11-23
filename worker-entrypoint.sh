#!/bin/bash

DB_HOST="db"
DB_PORT="5432"

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is up and running."

# Initialize LibreOffice for headless operation
echo "Initializing LibreOffice..."
libreoffice --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nologo --norestore --convert-to pdf /dev/null /tmp/test.pdf 2>/dev/null || true
rm -f /tmp/test.pdf
echo "LibreOffice initialized."

celery -A app.tasks.celery_app worker --loglevel=info