# 🚀 Deployment Guide - Deploy Owner

## 📋 Deployment Options

Chọn một trong các cách deploy phù hợp:

| Option | Dễ | Chi phí | Performance | Khuyến cáo |
|--------|-----|---------|-------------|-----------|
| **Vercel + Railway** | ⭐⭐⭐ | Free tier | ⭐⭐⭐ | Frontend + Backend |
| **Render** | ⭐⭐ | Free tier | ⭐⭐ | Full stack |
| **VPS (Digital Ocean)** | ⭐ | $6/month | ⭐⭐⭐⭐ | Production |
| **WSL Local** | ⭐⭐⭐ | Free | ⭐⭐ | Development |
| **Azure/AWS/GCP** | ⭐ | Pay as use | ⭐⭐⭐⭐ | Enterprise |

---

## 🎯 Option 1: Vercel + Railway (Recommended for Quick Start)

### Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   npm install -g railway
   railway login
   cd backend
   railway init
   railway up
   ```

3. **Add Environment Variables**
   - Railway Dashboard > Project > Variables
   - Add:
     ```
     MONGO_URI=<from MongoDB Atlas>
     JWT_SECRET=<strong-secret>
     MOMO_PARTNER_CODE=MOMO
     MOMO_ACCESS_KEY=<your-key>
     MOMO_SECRET_KEY=<your-secret>
     MOMO_REDIRECT_URL=<your-domain>/orders-success
     MOMO_IPN_URL=<your-domain>/api/momo/callback
     NODE_ENV=production
     ```

4. **Get Backend URL**
   - Railway provides: `https://yourproject.up.railway.app`

### Frontend on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   ```bash
   npm i -g vercel
   cd client
   vercel --prod
   ```

3. **Update Environment Variables**
   - Vercel Dashboard > Settings > Environment Variables
   ```
   VITE_API_URL=https://yourproject.up.railway.app
   ```

4. **Get Frontend URL**
   - Vercel provides: `https://yourproject.vercel.app`

---

## 🐳 Option 2: VPS Deployment (DigitalOcean/Linode)

### Prerequisites
- VPS with Ubuntu 20.04+
- SSH access
- Domain name (optional)

### Step 1: SSH into VPS

```bash
ssh root@your_vps_ip
```

### Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get install -y docker-compose

# Verify
docker --version
docker-compose --version
```

### Step 3: Clone Project

```bash
cd /home
git clone https://github.com/your-repo/DACNPM.git
cd DACNPM
```

### Step 4: Create Production .env

```bash
# Backend
cat > backend/.env << EOF
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/manager-btaskee
JWT_SECRET=your-production-secret-key-min-32-chars
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your-key
MOMO_SECRET_KEY=your-secret
MOMO_REDIRECT_URL=https://yourdomain.com/orders-success
MOMO_IPN_URL=https://yourdomain.com/api/momo/callback
NODE_ENV=production
EOF
```

### Step 5: Start Services with Docker Compose

```bash
# Build images
docker-compose build

# Start in background
docker-compose up -d

# Verify
docker-compose ps
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt-get install -y nginx

# Create config
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
systemctl enable certbot.timer
```

### Step 8: Monitor Services

```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend

# SSH back in to check status anytime
ssh root@your_vps_ip
docker-compose ps
```

---

## 🪟 Option 3: WSL (Windows Subsystem for Linux)

### Setup on Windows

1. **Enable WSL2**
   ```powershell
   # As Administrator
   wsl --install
   wsl --set-default-version 2
   ```

2. **Install Docker Desktop**
   - Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Enable WSL2 integration in settings

3. **Clone and Deploy**
   ```bash
   wsl
   cd /mnt/d/path/to/DACNPM
   docker-compose up -d
   ```

4. **Access**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

---

## ☁️ Option 4: Render (Full Stack)

### Deploy Backend

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect GitHub

2. **Create Web Service**
   - New > Web Service
   - Select your repo
   - Runtime: Node
   - Build: `npm install`
   - Start: `npm run dev`
   - Environment: Add variables (same as Railway)

3. **Get Backend URL**
   - Render provides: `https://yourapp.onrender.com`

### Deploy Frontend

1. **Create Static Site**
   - New > Static Site
   - Select client folder
   - Build: `npm install --legacy-peer-deps && npm run build`
   - Publish: `dist`

2. **Update Environment**
   - Site Settings > Environment
   ```
   VITE_API_URL=https://yourapp.onrender.com
   ```

---

## ✅ Deployment Checklist

### Before Deploy:
- [ ] All secrets in environment variables (NOT in code)
- [ ] MongoDB connection string tested
- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] Frontend build passes: `npm run build`
- [ ] Backend can start: `npm run dev`
- [ ] Dockerfile builds: `docker build .`

### After Deploy:
- [ ] Frontend loads on deployed URL
- [ ] Backend API responds: `curl https://api.yourdomain.com/api/auth/getall`
- [ ] Login works
- [ ] Database operations work
- [ ] No error messages in logs

### Monitoring:
- [ ] Setup error tracking (Sentry)
- [ ] Monitor logs regularly
- [ ] Set up uptime monitoring
- [ ] Test backups

---

## 🔒 Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Environment variables not exposed
- [ ] Database credentials secure
- [ ] JWT_SECRET strong
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints
- [ ] Regular dependency updates

---

## 📊 Monitoring & Maintenance

### Logs
```bash
# VPS/Docker
docker-compose logs -f

# Vercel/Render
Dashboard > Logs tab
```

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://..." --out=./backup

# Restore
mongorestore --uri="mongodb://..." ./backup
```

### Update Code
```bash
# VPS
cd /home/DACNPM
git pull origin main
docker-compose build
docker-compose up -d
```

---

## 🆘 Troubleshooting

### Port in Use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
```bash
# Check MongoDB URI format
mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true

# Verify IP whitelisting (MongoDB Atlas)
```

### Frontend Can't Reach Backend
```bash
# Check VITE_API_URL
# Check CORS in backend
# Check firewall rules
```

### Container Won't Start
```bash
docker-compose logs backend
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Support Resources

- **Docker Docs:** https://docs.docker.com
- **GitHub Actions:** https://docs.github.com/en/actions
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs

---

**Last Updated:** June 5, 2026  
**Maintainer:** Deploy Owner
