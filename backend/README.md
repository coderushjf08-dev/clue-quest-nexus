The API will be available at `http://localhost:3001`

### One-command Local Stack (Docker)

You can run Postgres and the API together with Docker:

```bash
cd backend
cp .env.example .env  # optional for local overrides
docker compose up --build
```

- API: `http://localhost:3001`
- Postgres: `postgres://postgres:postgres@localhost:5432/treasure_hunt_db`

On first startup, the container runs migrations and seeds the database automatically.