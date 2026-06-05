# 🚀 CI/CD Deployment Guide

## Overview

This project uses:
- **GitHub Actions** - Automated testing and building
- **Docker** - Containerization for consistent deployments
- **Docker Compose** - Local development environment
- **Nginx** - Reverse proxy for production

---

## 📋 CI/CD Pipeline

### Workflow: `.github/workflows/ci-cd.yml`

**Triggers:**
- ✅ Push to `main` or `develop` branches
- ✅ Pull requests to `main` or `develop` branches

**Jobs:**

1. **Backend Test** 
   - Sets up Node.js 18
   - Starts MongoDB service
   - Installs dependencies
   - Verifies environment variables
   - Checks for linting issues

2. **Frontend Test**
   - Sets up Node.js 18
   - Installs dependencies (with legacy peer deps)
   - Builds the project
   - Checks for linting issues

3. **Docker Build**
   - Builds Backend Docker image
   - Builds Frontend Docker image
   - Uses Docker layer caching

4. **Security Scan**
   - Detects exposed secrets
   - Scans dependencies for vulnerabilities
   - Fails if secrets are found in code

5. **Notification**
   - Reports pipeline status
   - Fails if any job fails

---

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| MongoDB | 27017 | Database |
| Backend | 5000 | API Server |
| Frontend | 5173 | Web UI |
| Nginx | 80, 443 | Reverse Proxy |

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/*
- **Health Check:** http://localhost/health

---

## 📦 Local Development with Docker Compose

### Build custom image (optional)

```bash
docker-compose build
```

### Run services

```bash
docker-compose up -d
```

### View real-time logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Execute commands in container

```bash
# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh

# Access MongoDB
docker-compose exec mongodb mongosh
```

### Stop services

```bash
# Stop without removing containers
docker-compose stop

# Stop and remove everything
docker-compose down

# Stop and remove with volumes (fresh start)
docker-compose down -v
```

---

## 🔐 Environment Variables for Docker

Create `.env` file in project root:

```env
# Database
MONGO_URI=mongodb://admin:password@mongodb:27017/manager-btaskee?authSource=admin

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Momo Payment
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_REDIRECT_URL=http://localhost:5173/orders-success
MOMO_IPN_URL=http://localhost:5000/api/momo/callback

# Environment
NODE_ENV=development
```

Docker Compose will use these variables for the services.

---

## 🌐 Nginx Configuration

### Features
- ✅ Reverse proxy for backend and frontend
- ✅ Gzip compression
- ✅ Health check endpoint
- ✅ SSL/TLS ready (commented out)
- ✅ Large file upload support (20MB)

### Enable HTTPS (Production)

1. Uncomment SSL section in `nginx.conf`
2. Add certificate files:
   ```bash
   mkdir -p ./ssl
   # Add cert.pem and key.pem
   ```
3. Rebuild container

### Access via Nginx

```
http://localhost      # Frontend
http://localhost/api/ # Backend API
http://localhost/health # Health check
```

---

## 🚀 Deployment Strategies

### Option 1: GitHub Actions + Docker Hub

```yaml
# Add to ci-cd.yml
- name: Push to Docker Hub
  run: |
    echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
    docker tag dacnpm-backend ${{ secrets.DOCKER_USERNAME }}/dacnpm-backend:latest
    docker push ${{ secrets.DOCKER_USERNAME }}/dacnpm-backend:latest
```

### Option 2: Deploy to VPS with Docker Compose

```bash
# On VPS
git clone https://github.com/your-repo/DACNPM.git
cd DACNPM
docker-compose up -d
```

### Option 3: Deploy to Cloud (AWS, Azure, GCP)

- **AWS ECS:** Use Docker images with ECS task definitions
- **Azure Container Instances:** Run Docker images directly
- **Google Cloud Run:** Deploy containerized apps

---

## ✅ GitHub Actions Setup

### 1. Required Secrets (if using Docker Hub)

Go to **Settings > Secrets > Actions**:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub token

### 2. View Workflow Status

1. Push code to GitHub
2. Go to **Actions** tab
3. Watch the pipeline run
4. Check logs for each job

### 3. Badge in README

```markdown
[![CI/CD Pipeline](https://github.com/your-repo/DACNPM/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-repo/DACNPM/actions)
```

---

## 🐛 Troubleshooting

### Docker Issues

```bash
# Clear all Docker resources
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# Check service logs
docker-compose logs <service-name>
```

### Port Already in Use

```bash
# Kill process on port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
# Should be: mongodb://admin:password@mongodb:27017/manager-btaskee?authSource=admin
```

### Build Failures

```bash
# Rebuild without cache
docker-compose build --no-cache --pull

# View build output
docker-compose up --build
```

---

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# Check health
curl http://localhost/health
```

### View Metrics

```bash
# Docker resource usage
docker stats

# Container logs
docker-compose logs -f
```

---

## 🔒 Security Best Practices

1. **Secrets Management**
   - Never commit `.env` to git
   - Use GitHub Secrets for sensitive data
   - Rotate credentials regularly

2. **Image Security**
   - Use specific base image versions (not `latest`)
   - Regular dependency updates
   - Scan images for vulnerabilities

3. **Network Security**
   - Use `sameSite=strict` for cookies (✅ Done)
   - Enable HTTPS in production
   - Use strong JWT secrets

4. **Access Control**
   - Restrict who can deploy
   - Use branch protection rules
   - Require PR reviews

---

## 📞 CI/CD Owner Responsibilities

1. **Maintenance**
   - Update base images regularly
   - Monitor failed pipelines
   - Keep dependencies current

2. **Monitoring**
   - Watch GitHub Actions dashboard
   - Review security scan results
   - Check deployment logs

3. **Troubleshooting**
   - Fix broken builds
   - Debug test failures
   - Resolve deployment issues

4. **Documentation**
   - Keep this guide updated
   - Document deployment procedures
   - Maintain runbooks

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated:** June 5, 2026
**Maintainer:** CI/CD Owner
