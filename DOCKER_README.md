# SkillWise Docker Development Environment

This Docker Compose setup provides a complete development environment for the SkillWise AI Tutor application.

## Services

- **PostgreSQL 15** (`database`) - Database server on port `5432`
  - Database: `skillwise_db`
  - User: `skillwise_user`
  - Password: `skillwise_pass`
- **Redis 7** (`redis`) - Caching and session store on port `6379`

- **Backend API** (`backend`) - Node.js/Express server on port `3001`
  - Hot reloading enabled for development
  - All environment variables configured
- **Frontend** (`frontend`) - React application on port `3000`
  - Hot reloading enabled for development
  - Connected to backend API

## Quick Start

1. **Start all services:**

   ```bash
   docker-compose up -d
   ```

2. **View logs:**

   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f database
   ```

3. **Stop all services:**

   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (reset database):**
   ```bash
   docker-compose down -v
   ```

## Development Workflow

### Making Changes

- **Backend**: Edit files in `./backend/` - changes will be reflected immediately
- **Frontend**: Edit files in `./frontend/` - React will hot reload automatically
- **Database**: Migration files in `./backend/database/migrations/` run on container startup

### Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432 (use any PostgreSQL client)
- **Redis**: localhost:6379

### Environment Variables

The docker-compose.yml includes all necessary environment variables. For local development outside Docker, copy the `.env.example` files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Database Management

#### Connect to Database

```bash
# Using docker exec
docker-compose exec database psql -U skillwise_user -d skillwise_db

# Using local psql client
psql -h localhost -p 5432 -U skillwise_user -d skillwise_db
```

#### Run Migrations

Place SQL migration files in `./backend/database/migrations/` and they will run automatically when the database container starts.

#### Backup Database

```bash
docker-compose exec database pg_dump -U skillwise_user skillwise_db > backup.sql
```

#### Restore Database

```bash
docker-compose exec -T database psql -U skillwise_user skillwise_db < backup.sql
```

### Troubleshooting

#### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - '3001:3001' # Change first number to available port
```

#### Rebuild Containers

```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all services
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

#### Reset Everything

```bash
# Stop containers and remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a

# Start fresh
docker-compose up --build -d
```

#### View Container Status

```bash
docker-compose ps
```

#### Shell into Container

```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh

# Database container
docker-compose exec database bash
```

## Health Checks

The setup includes health checks for:

- **Database**: Checks if PostgreSQL is ready to accept connections
- **Redis**: Checks if Redis is responding to ping
- **Dependencies**: Backend waits for database to be healthy before starting

## Volume Mounts

### Development Volumes

- `./backend:/app` - Backend source code (live reload)
- `./frontend:/app` - Frontend source code (live reload)
- `./backend/database/migrations:/docker-entrypoint-initdb.d` - Database migrations

### Persistent Volumes

- `postgres_data` - Database data persistence
- `redis_data` - Redis data persistence
- `backend_logs` - Backend application logs

## Network

All services communicate via the `skillwise_network` bridge network, allowing containers to reach each other by service name (e.g., `database`, `redis`).

## Production Notes

This setup is optimized for development with:

- Source code mounted as volumes for hot reloading
- Development environment variables
- Non-optimized container builds

For production deployment:

1. Create separate `docker-compose.prod.yml`
2. Use multi-stage builds for optimized images
3. Remove volume mounts for source code
4. Use production environment variables
5. Enable SSL/TLS
6. Configure proper logging and monitoring
