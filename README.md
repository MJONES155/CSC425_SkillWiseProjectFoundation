# SkillWise AI Tutor 🎓

An intelligent AI-powered tutoring platform built with React, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

Before cloning and running this project, you need to install the following software:

#### Required Software

- **Docker Desktop** (v4.0+) - [Download here](https://www.docker.com/products/docker-desktop/)
  - Includes Docker and Docker Compose
- **Node.js** (v18+) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

#### Optional (for local development without Docker)

- **PostgreSQL** (v15+) - [Download here](https://www.postgresql.org/download/)
- **Redis** (v7+) - [Download here](https://redis.io/download)

### Development Tools (Recommended)

- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Thunder Client (for API testing)
  - Docker extension
- **Postman** or **Insomnia** (for API testing)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DrOwen101/SkillWise_AITutor_Initial-Setup-Push.git
cd SkillWise_AITutor_Initial-Setup-Push
```

### 2. Environment Setup (Optional)

Create environment files if you need to customize settings:

#### Root `.env` (optional)

```env
# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Email Configuration (for notifications)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn-url
```

### 3. Start Development Environment

```bash
# Install root dependencies (for linting and git hooks)
npm install

# Start the entire application with Docker
npm run dev:all
```

This single command will:

- Build and start PostgreSQL database (with all migrations)
- Build and start Redis cache
- Build and start Node.js backend API
- Build and start React frontend
- Set up all networking between services

### 4. Access the Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/healthz

## 🛠 Development Workflow

### Available Scripts

```bash
# Start everything (recommended)
npm run dev:all

# View logs from all services
npm run logs

# View logs from specific service
npm run logs:backend
npm run logs:frontend
npm run logs:db

# Stop everything and clean up
npm run down

# Rebuild containers (when dependencies change)
npm run rebuild

# Reset everything (clean slate)
npm run reset
```

### Working with the Code

#### Backend Development (Node.js/Express)

```bash
# Backend files are in ./backend/
cd backend/

# Dependencies are automatically installed via Docker
# But you can install locally for IDE support:
npm install

# Key directories:
- src/routes/      # API endpoints
- src/controllers/ # Business logic
- src/models/      # Database models
- src/services/    # Service layer
- src/middleware/  # Express middleware
- database/migrations/ # Database schema
```

#### Frontend Development (React)

```bash
# Frontend files are in ./frontend/
cd frontend/

# Dependencies are automatically installed via Docker
# But you can install locally for IDE support:
npm install

# Key directories:
- src/components/  # Reusable components
- src/pages/      # Page components
- src/utils/      # Utilities and API client
- src/styles/     # CSS and styling
- public/         # Static assets
```

### Database Management

The PostgreSQL database is automatically set up with all migrations when you start the application.

#### Database Access

- **Host**: localhost
- **Port**: 5433 (mapped from container's 5432)
- **Database**: skillwise_db
- **Username**: skillwise_user
- **Password**: skillwise_pass

#### Database Tools

```bash
# Connect via psql
psql -h localhost -p 5433 -U skillwise_user -d skillwise_db

# Or use GUI tools like pgAdmin, DBeaver, etc.
```

## 🏗 Project Structure

```
SkillWise_AITutor/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 utils/           # Utilities & API client
│   │   └── 📁 styles/          # CSS and styling
│   ├── 📄 package.json         # Frontend dependencies
│   └── 📄 Dockerfile.dev       # Frontend container config
│
├── 📁 backend/                  # Node.js backend API
│   ├── 📁 src/
│   │   ├── 📁 routes/          # API route handlers
│   │   ├── 📁 controllers/     # Business logic controllers
│   │   ├── 📁 models/          # Database models
│   │   ├── 📁 services/        # Service layer
│   │   ├── 📁 middleware/      # Express middleware
│   │   └── 📁 utils/           # Backend utilities
│   ├── 📁 database/
│   │   └── 📁 migrations/      # SQL migration files
│   ├── 📄 package.json         # Backend dependencies
│   └── 📄 Dockerfile.dev       # Backend container config
│
├── 📁 docs/                     # Documentation
├── 📄 docker-compose.yml       # Multi-service Docker setup
├── 📄 package.json            # Root package with scripts
└── 📄 README.md               # This file
```

## 🔧 Technology Stack

### Frontend

- **React 18** - UI library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Headless UI** - Accessible components

### Backend

- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and sessions
- **JWT** - Authentication
- **Zod** - Schema validation
- **Pino** - Structured logging
- **OpenAI API** - AI capabilities

### Development

- **Docker & Docker Compose** - Containerization
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Backend testing
- **React Testing Library** - Frontend testing
- **Cypress** - E2E testing

## 🧪 Testing

### Run Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test

# Run with coverage
docker-compose exec backend npm run test:coverage
docker-compose exec frontend npm run test:coverage
```

### E2E Testing

```bash
# Open Cypress (requires frontend to be running)
cd frontend && npx cypress open
```

## 📝 API Documentation

Once the backend is running, you can access:

- **API Overview**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/healthz

### Key API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/profile` - Get user profile
- `GET /api/challenges` - List challenges
- `POST /api/progress` - Track progress
- `GET /api/leaderboard` - View leaderboard

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the ports
lsof -ti:3000  # Frontend
lsof -ti:3001  # Backend
lsof -ti:5433  # Database

# Kill processes if needed
kill -9 <PID>
```

#### Docker Issues

```bash
# Clean up and restart
npm run down
docker system prune -f
npm run dev:all
```

#### Database Connection Issues

```bash
# Check database logs
npm run logs:db

# Reset database
npm run down
docker volume rm skillwise_aitutor_postgres_data
npm run dev:all
```

#### Frontend Won't Load

```bash
# Check frontend logs
npm run logs:frontend

# Rebuild frontend container
docker-compose build --no-cache frontend
npm run dev:all
```

#### Backend API Errors

```bash
# Check backend logs
npm run logs:backend

# Rebuild backend container
docker-compose build --no-cache backend
npm run dev:all
```

### Development Tips

1. **Hot Reloading**: Both frontend and backend support hot reloading
2. **Database Changes**: Add new migration files to `backend/database/migrations/`
3. **API Testing**: Use the Thunder Client VS Code extension or Postman
4. **Debugging**: Use browser DevTools and VS Code debugger
5. **Code Formatting**: Install Prettier extension in VS Code for auto-formatting

### Getting Help

If you encounter issues:

1. Check the logs: `npm run logs`
2. Try resetting: `npm run reset`
3. Check this README's troubleshooting section
4. Search existing GitHub issues
5. Create a new issue with logs and steps to reproduce

## 📋 Development Checklist

When setting up for the first time:

- [ ] Install Docker Desktop
- [ ] Install Node.js (v18+)
- [ ] Install Git
- [ ] Clone the repository
- [ ] Run `npm install` in root directory
- [ ] Run `npm run dev:all`
- [ ] Verify frontend loads at http://localhost:3000
- [ ] Verify backend API at http://localhost:3001/api
- [ ] Install recommended VS Code extensions
- [ ] Set up environment variables (if using AI/email features)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 What You Get Out of the Box

This repository provides a complete, production-ready development environment with:

✅ **Full-stack application** running in Docker containers  
✅ **Database** with complete schema and migrations  
✅ **API** with authentication, validation, and error handling  
✅ **Frontend** with routing, forms, and responsive design  
✅ **Development tools** with hot reloading and debugging  
✅ **Code quality** with linting, formatting, and git hooks  
✅ **Testing setup** for unit, integration, and E2E tests  
✅ **Documentation** and development guidelines

Just run `npm run dev:all` and start coding! 🚀
