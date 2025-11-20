# Developer Setup Guide

## Prerequisites Installation Guide

### 1. Docker Desktop

**Required for running the application**

#### Windows:

1. Download from https://www.docker.com/products/docker-desktop/
2. Run installer and restart computer
3. Verify: Open terminal and run `docker --version`

#### macOS:

1. Download from https://www.docker.com/products/docker-desktop/
2. Drag to Applications folder
3. Open Docker Desktop and complete setup
4. Verify: Open terminal and run `docker --version`

#### Linux:

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 2. Node.js (v18 or later)

**Required for local development tooling**

#### All Platforms:

1. Visit https://nodejs.org/
2. Download LTS version (18.x or later)
3. Run installer
4. Verify: `node --version` and `npm --version`

#### Alternative (using nvm):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
nvm alias default 18
```

### 3. Git

**Required for version control**

#### Windows:

1. Download from https://git-scm.com/
2. Run installer (use default settings)
3. Verify: `git --version`

#### macOS:

```bash
# Using Homebrew (recommended)
brew install git

# Or download from https://git-scm.com/
```

#### Linux:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install git

# CentOS/RHEL
sudo yum install git

# Verify
git --version
```

## Quick Start Guide

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/DrOwen101/SkillWise_AITutor_Initial-Setup-Push.git
cd SkillWise_AITutor_Initial-Setup-Push

# Install root dependencies (for git hooks and linting)
npm install
```

### 2. Start Development Environment

```bash
# One command starts everything!
npm run dev:all
```

Wait for all services to start (usually 30-60 seconds), then:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### 3. Verify Everything Works

```bash
# Check all services are running
docker-compose ps

# Should show 4 services: frontend, backend, database, redis
# All should have "Up" status
```

## Development Environment Details

### What Gets Started Automatically

When you run `npm run dev:all`, Docker Compose starts:

1. **PostgreSQL Database** (port 5433)

   - Pre-loaded with complete schema
   - 11 migration files applied automatically
   - Test data ready to use

2. **Redis Cache** (port 6379)

   - Ready for session storage
   - Configured for development

3. **Node.js Backend** (port 3001)

   - Express API server with hot reload
   - All routes and middleware configured
   - Automatic database connection

4. **React Frontend** (port 3000)
   - Complete UI with hot reload
   - Pre-built components and pages
   - API client configured

### File Structure for Development

```
SkillWise_AITutor/
├── frontend/src/
│   ├── components/          # Add new React components here
│   ├── pages/              # Add new pages here
│   ├── utils/              # API client and utilities
│   └── styles/             # CSS and styling
│
├── backend/src/
│   ├── routes/             # Add new API endpoints here
│   ├── controllers/        # Business logic controllers
│   ├── models/            # Database models
│   ├── services/          # Service layer
│   └── middleware/        # Express middleware
│
└── backend/database/migrations/  # Database changes go here
```

### Making Changes

#### Adding a New API Endpoint

1. Create route in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Update service if needed in `backend/src/services/`
4. Test at http://localhost:3001/api/your-endpoint

#### Adding a New React Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Update navigation if needed
4. View at http://localhost:3000/your-page

#### Database Changes

1. Add new migration file in `backend/database/migrations/`
2. Follow naming: `012_description.sql`
3. Restart database: `npm run down && npm run dev:all`

## Optional Environment Variables

### For AI Features (OpenAI Integration)

Create `.env` file in project root:

```env
OPENAI_API_KEY=your-openai-api-key
```

Get API key from: https://platform.openai.com/api-keys

### For Email Features (Password Reset)

Add to `.env` file:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

Gmail App Password setup:

1. Enable 2-factor authentication on Gmail
2. Go to Google Account > Security > App Passwords
3. Generate password for "Mail"
4. Use generated password (not regular Gmail password)

## Development Tools Setup

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

```bash
# Install VS Code first: https://code.visualstudio.com/

# Then install extensions:
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode-remote.remote-containers
code --install-extension rangav.vscode-thunder-client
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-azuretools.vscode-docker
```

Or install manually in VS Code:

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (API testing)
- Docker
- Tailwind CSS IntelliSense

### Git Configuration

```bash
# Set up your identity (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set VS Code as default editor
git config --global core.editor "code --wait"
```

## Dependency Management

### Adding New Dependencies

#### Frontend (React)

```bash
# Option 1: Add to container and rebuild
docker-compose exec frontend npm install package-name
docker-compose restart frontend

# Option 2: Add to package.json and rebuild
cd frontend
# Edit package.json
npm run rebuild  # from root directory
```

#### Backend (Node.js)

```bash
# Option 1: Add to container and rebuild
docker-compose exec backend npm install package-name
docker-compose restart backend

# Option 2: Add to package.json and rebuild
cd backend
# Edit package.json
npm run rebuild  # from root directory
```

### Local Development Setup (Alternative to Docker)

If you prefer running services locally instead of Docker:

#### Prerequisites

- PostgreSQL 15+ installed locally
- Redis 7+ installed locally
- Node.js 18+ installed

#### Setup Steps

```bash
# 1. Database setup
createdb skillwise_db
psql skillwise_db -c "CREATE USER skillwise_user WITH PASSWORD 'skillwise_pass';"
psql skillwise_db -c "GRANT ALL PRIVILEGES ON DATABASE skillwise_db TO skillwise_user;"

# 2. Run migrations
cd backend
for file in database/migrations/*.sql; do
  psql -h localhost -U skillwise_user -d skillwise_db -f "$file"
done

# 3. Start Redis
redis-server

# 4. Start backend
cd backend
npm install
npm run dev

# 5. Start frontend (in new terminal)
cd frontend
npm install
npm start
```

## Testing Your Setup

### Verify Services

```bash
# Check all containers are running
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test backend API
curl http://localhost:3001/api

# Test database connection
docker-compose exec backend npm run test:db
```

### Common Issues and Solutions

#### "Port already in use"

```bash
# Find what's using the port
lsof -ti:3000   # or 3001, 5433, 6379

# Kill the process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

#### "Docker daemon not running"

- Start Docker Desktop application
- Wait for it to fully load (whale icon in system tray)

#### "Cannot connect to database"

```bash
# Check database logs
npm run logs:db

# Reset database
npm run down
docker volume rm skillwise_aitutor_postgres_data
npm run dev:all
```

#### "npm install fails"

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Performance Tips

1. **Allocate more memory to Docker**

   - Docker Desktop > Settings > Resources > Memory (4GB recommended)

2. **Enable file sharing for hot reload**

   - Docker Desktop > Settings > Resources > File Sharing
   - Add your project directory

3. **Use .dockerignore files**
   - Already configured to ignore node_modules, .git, etc.

## What's Included Out of the Box

✅ **Complete full-stack application**  
✅ **Database with sample data**  
✅ **Authentication system (JWT)**  
✅ **API with 10+ endpoints**  
✅ **Responsive React UI**  
✅ **Hot reload for development**  
✅ **Code linting and formatting**  
✅ **Git hooks for code quality**  
✅ **Testing setup (Jest, React Testing Library)**  
✅ **Docker containerization**  
✅ **Development and production configs**

## Next Steps

After getting everything running:

1. **Explore the codebase**

   - Check out the API at http://localhost:3001/api
   - Browse the React components in `frontend/src/`
   - Look at database schema in `backend/database/migrations/`

2. **Make your first change**

   - Try adding a new page to the frontend
   - Or add a new API endpoint to the backend

3. **Set up your preferred development workflow**

   - Configure your IDE
   - Set up debugging
   - Customize git hooks

4. **Read the main README.md**
   - Detailed architecture information
   - API documentation
   - Contributing guidelines

Happy coding! 🚀
