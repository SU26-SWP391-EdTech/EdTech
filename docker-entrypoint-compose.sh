#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Start the Docker daemon (required for Docker-in-Docker).
# ---------------------------------------------------------------------------
dockerd-entrypoint.sh &
DOCKERD_PID=$!

echo "Waiting for Docker daemon to be ready..."
until docker info >/dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon is ready."

# ---------------------------------------------------------------------------
# Railway injects $PORT for the publicly exposed service. The frontend nginx
# container listens on port 80 inside the Compose network. We remap the
# docker-compose frontend port binding to $PORT so Railway's health checks
# and routing work correctly.
# ---------------------------------------------------------------------------
export PORT="${PORT:-80}"

# Override the frontend host port to match Railway's $PORT.
# The docker-compose.yml maps "80:80" for the frontend service; we replace
# the host-side with $PORT at runtime using an override file.
cat > /app/docker-compose.override.yml <<EOF
version: "3.8"
services:
  frontend:
    ports:
      - "${PORT}:80"
EOF

# ---------------------------------------------------------------------------
# Build and start all services defined in docker-compose.yml.
# ---------------------------------------------------------------------------
cd /app
docker compose up --build

# Keep the entrypoint alive if docker compose exits (e.g. on signal).
wait $DOCKERD_PID
