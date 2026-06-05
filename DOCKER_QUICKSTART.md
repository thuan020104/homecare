# 🐳 Docker Quick Start Guide

## 1️⃣ Start All Services

```bash
cd D:\01_CongNgheThongTin\08_HocKy8\DACNPM
docker-compose up -d
```

## 2️⃣ Check Status

```bash
docker-compose ps
```

**Output should show:**
- ✅ dacnpm-mongodb - Running
- ✅ dacnpm-backend - Running  
- ✅ dacnpm-frontend - Running

## 3️⃣ Access Applications

- 🌐 **Frontend:** http://localhost:5173
- 🔌 **Backend API:** http://localhost:5000
- 🗄️ **MongoDB:** localhost:27017

## 📋 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services
```bash
# Stop all (keep containers)
docker-compose stop

# Stop and remove
docker-compose down

# Stop and remove EVERYTHING (fresh start)
docker-compose down -v
```

### Restart
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Execute Commands
```bash
# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh

# Access MongoDB
docker-compose exec mongodb mongosh
```

### Rebuild Images
```bash
# Rebuild one service
docker-compose build backend

# Rebuild all
docker-compose build

# Rebuild without cache
docker-compose build --no-cache
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### MongoDB Connection Error
```bash
# Connection string in docker-compose.yml:
mongodb://admin:password123@mongodb:27017/manager-btaskee?authSource=admin
```

---

**Done! 🎉 Your project is now containerized!**
