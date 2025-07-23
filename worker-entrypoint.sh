#!/bin/bash

DB_HOST="db"
DB_PORT="5432"

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is up and running."

celery -A app.tasks.celery_app worker --loglevel=info