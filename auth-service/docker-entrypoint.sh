#!/bin/sh
set -e

if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
  echo "DB_HOST and DB_PORT must be set"
  exit 1
fi

echo "Waiting for MySQL at $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Waiting for database..."
  sleep 2
done

echo "Database reachable, running migrations..."
npm run migrate

echo "Starting auth-service..."
exec "$@"
