# 🚀 Render Deployment Guide - Step by Step

## 📋 Overview

Render là nền tảng deploy dễ dùng:
- ✅ Free tier available
- ✅ Auto deploy từ GitHub
- ✅ HTTPS tự động
- ✅ Environment variables quản lý dễ
- ✅ Monitoring & logs built-in

---

## 🎯 Step 1: Prepare GitHub Repository

### 1.1 Ensure Backend is Ready
```bash
# Backend must have:
# - package.json with "start" script
# - .env.example file
# - PORT configured (default 5000)

cd backend
cat package.json | grep -A 5 '"scripts"'
```

**Update backend/package.json if needed:**
```json
{
  "scripts": {
    "dev": "nodemon --inspect index.js",
    "start": "node index.js"
  }
}
```

### 1.2 Ensure Frontend is Ready
```bash
# Frontend must have:
# - build script
# - dist output

cd ../client
cat package.json | grep -A 3 '"build"'
```

### 1.3 Create .env.example files (already done ✓)

```bash
# backend/.env.example
MONGO_URI=
JWT_SECRET=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_REDIRECT_URL=
MOMO_IPN_URL=
NODE_ENV=production
```

### 1.4 Push to GitHub

```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main
```

---

## 🔗 Step 2: Setup MongoDB Atlas (Cloud Database)

### 2.1 Create Account
1. Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Sign up (Gmail is easiest)

### 2.2 Create Free Cluster
1. Click **"Build a Cluster"**
2. Choose **"M0 Sandbox"** (FREE)
3. Select region closest to you
4. Click **"Create"**

### 2.3 Create Database User
1. Click **"Database Access"** (left menu)
2. Click **"+ Add Database User"**
3. Enter:
   - Username: `dbadmin`
   - Password: (generate strong one, copy it!)
   - Role: **readWrite**
4. Click **"Add User"**

### 2.4 Whitelist IP Addresses
1. Click **"Network Access"** (left menu)
2. Click **"+ Add IP Address"**
3. For testing: Add `0.0.0.0/0` (allow all)
   - ⚠️ For production: add specific IPs only
4. Click **"Confirm"**

### 2.5 Get Connection String
1. Click **"Clusters"** (left menu)
2. Click **"Connect"** button
3. Select **"Connect your application"**
4. Choose Node.js + your version
5. Copy the connection string:
   ```
   mongodb+srv://dbadmin:PASSWORD@cluster.mongodb.net/manager-btaskee?retryWrites=true&w=majority
   ```
   - Replace `PASSWORD` with your password
   - Replace `manager-btaskee` with database name

**Save this! You'll need it for Render.**

---

## 🎯 Step 3: Deploy Backend on Render

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Sign up"**
3. Connect with **GitHub**

### 3.2 Create Backend Service
1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   - **Name:** `dacnpm-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3.3 Add Environment Variables
1. Scroll to **"Environment"**
2. Click **"Add Environment Variable"**
3. Add each variable (one by one):

```
MONGO_URI = mongodb+srv://dbadmin:YOUR_PASSWORD@cluster.mongodb.net/manager-btaskee?retryWrites=true&w=majority

JWT_SECRET = your-super-secret-key-min-32-characters-long-abc123

MOMO_PARTNER_CODE = MOMO

MOMO_ACCESS_KEY = F8BBA842ECF85

MOMO_SECRET_KEY = K951B6PE1waDMi640xX08PD3vg6EkVlz

MOMO_REDIRECT_URL = https://your-frontend-url.onrender.com/orders-success

MOMO_IPN_URL = https://your-backend-url.onrender.com/api/momo/callback

NODE_ENV = production
```

### 3.4 Deploy
1. Scroll down
2. Click **"Create Web Service"**
3. Wait for build to complete (2-5 minutes)
4. When done, you get a URL like: `https://dacnpm-backend.onrender.com`

**Save this URL! You'll need it for frontend.**

---

## 🎯 Step 4: Deploy Frontend on Render

### 4.1 Create Frontend Service
1. Click **"New +"** (top right)
2. Select **"Static Site"**
3. Connect your GitHub repository
4. Fill in:
   - **Name:** `dacnpm-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory:** `dist`

### 4.2 Add Environment Variables
1. Scroll to **"Environment"**
2. Add:
   ```
   VITE_API_URL = https://dacnpm-backend.onrender.com
   ```

### 4.3 Deploy
1. Scroll down
2. Click **"Create Static Site"**
3. Wait for build to complete (2-3 minutes)
4. You get a URL like: `https://dacnpm-frontend.onrender.com`

---

## 🔄 Step 5: Update Backend MOMO URLs

Now that you have both URLs, update backend environment variables:

1. Go to **Render Dashboard**
2. Select **Backend service** (dacnpm-backend)
3. Go to **Environment** tab
4. Update:
   ```
   MOMO_REDIRECT_URL = https://dacnpm-frontend.onrender.com/orders-success
   MOMO_IPN_URL = https://dacnpm-backend.onrender.com/api/momo/callback
   ```
5. Click **"Deploy"** to redeploy with new variables

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Backend
```bash
# Replace with your backend URL
curl https://dacnpm-backend.onrender.com/api/auth/getall

# Should return employee list (or empty array)
```

### 6.2 Test Frontend
1. Open `https://dacnpm-frontend.onrender.com` in browser
2. Should see your app
3. Try login to test backend connection

### 6.3 Check Logs
1. Go to **Render Dashboard**
2. Select each service
3. Click **"Logs"** tab
4. Look for errors

---

## 🔄 Continuous Deployment

### Auto Deploy on Git Push
1. Go to Render Dashboard
2. Select service
3. Go to **Settings** tab
4. Look for **"Auto-Deploy"**
5. Make sure it's **"On"**

Now every `git push origin main` will:
1. Trigger GitHub Actions tests
2. Auto-deploy to Render (if tests pass)

---

## 📊 Monitoring

### View Logs
1. Render Dashboard > Service > Logs tab
2. Can filter by log level

### View Metrics
1. Render Dashboard > Service > Metrics tab
2. CPU, Memory, Requests usage

### Restart Service
1. Render Dashboard > Service
2. Click **"..." (three dots)**
3. Select **"Restart"**

---

## 🚨 Troubleshooting

### Build Failing
**Check:**
```bash
# 1. Build command locally works?
cd backend
npm install
npm start  # or npm run dev

# 2. Check logs on Render
Render > Service > Logs tab
```

### App Crashes
**Common issues:**
- Missing environment variable
- Database connection string wrong
- Port not exposed

**Fix:**
1. Check Render logs for error message
2. Update .env variables
3. Restart service

### Frontend Can't Reach Backend
**Check:**
1. `VITE_API_URL` is correct
2. Backend is running (check logs)
3. Frontend built with correct URL

**Fix:**
1. Update `VITE_API_URL` in frontend environment
2. Redeploy frontend

### Database Connection Error
**Check:**
1. MongoDB URI is correct
2. Username/password correct
3. IP whitelisted in MongoDB Atlas

**Test locally:**
```bash
npm install -g mongosh
mongosh "your-mongodb-uri"
```

---

## 📝 Important Notes

### Free Tier Limits
- Services spin down after 15 min inactivity
- First request after spindown takes 30 seconds
- 100GB/month bandwidth

### To Keep Running 24/7
Upgrade to **Paid** tier (starts at $7/month)

### Database on Free Tier
MongoDB Atlas M0 is always free and always running

---

## 🎉 You're Done!

**Your app is now live!**

- Frontend: `https://dacnpm-frontend.onrender.com`
- Backend: `https://dacnpm-backend.onrender.com`
- Database: MongoDB Atlas (cloud)

**Share these URLs with your team!**

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/
- **Project Repo:** Your GitHub repo

---

**Next Steps:**
1. ✅ Test all features
2. ✅ Monitor logs
3. ✅ Setup alerts (optional)
4. ✅ Share with team
5. ✅ Monitor performance

**Render Owner - You're all set! 🚀**
