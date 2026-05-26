# Docker Setup (CareerPath)

This repo includes a docker.yml file that starts the full stack with one command using Docker Compose.

## What docker.yml runs

- mongo: MongoDB 7 with a persistent volume.
- redis: Redis 7 (optional cache for the backend).
- backend: Node 20 container running the Express API on port 5000.
- frontend: Node 20 container running the Vite dev server on port 5173.

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

## One-command start

From the repo root:

```
docker compose -f docker.yml up --build
```

Then open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/health

## Stop and clean up

Stop containers:
```
docker compose -f docker.yml down
```

Remove containers and volumes (wipes database/cache):
```
docker compose -f docker.yml down -v
```

## Environment variables

The docker.yml file sets safe defaults for local development:

- MONGODB_URI: mongodb://mongo:27017/careercompass
- JWT_SECRET: dev_jwt_secret_change_me
- FRONTEND_URL / FRONTEND_ORIGIN: http://localhost:5173
- VITE_API_BASE_URL: http://localhost:5000/api
- REDIS_HOST / REDIS_PORT: redis / 6379

If you want AI or email features, add these under the backend service in docker.yml:

- GEMINI_API_KEY or GEMINI_API_KEYS
- EMAIL_USER and EMAIL_PASSWORD

## Notes

- This setup is for local development and uses bind mounts for live reload.
- File watching is enabled via CHOKIDAR_USEPOLLING for better Windows support.
- For production, use separate Dockerfiles and build images instead of running dev servers.
