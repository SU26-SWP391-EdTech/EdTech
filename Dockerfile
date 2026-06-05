# Root Dockerfile — orchestrates the full EdTech stack via docker-compose.yml.
# Uses Docker-in-Docker (dind) so Railway can build and run all services
# (db, backend, frontend, phpmyadmin) defined in docker-compose.yml from a
# single container entry point.

FROM docker:27-dind

# Install Docker Compose v2 plugin and bash
RUN apk add --no-cache bash curl

RUN mkdir -p /usr/local/lib/docker/cli-plugins \
    && curl -SL "https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64" \
       -o /usr/local/lib/docker/cli-plugins/docker-compose \
    && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

WORKDIR /app

# Copy the entire repository into the image
COPY . .

# Expose the ports used by the services in docker-compose.yml:
#   80   — frontend (nginx)
#   3000 — backend (NestJS)
#   3306 — MySQL (DB_PORT, overridable via env)
#   8080 — phpMyAdmin (PMA_PORT, overridable via env)
EXPOSE 80 3000 3306 8080

# Entrypoint: start the Docker daemon in the background, wait for it to be
# ready, then bring up all Compose services in the foreground.
# Railway's $PORT is forwarded to the frontend nginx port (80) via the
# docker-compose port mapping; set PORT=80 as the default if not provided.
COPY docker-entrypoint-compose.sh /usr/local/bin/docker-entrypoint-compose.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-compose.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-compose.sh"]
