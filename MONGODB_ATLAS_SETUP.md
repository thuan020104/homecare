# Production MongoDB Atlas Connection

## Setup MongoDB Atlas

### 1. Create Account
- Go to [mongodb.com/cloud](https://www.mongodb.com/cloud)
- Sign up with email or Google

### 2. Create Cluster
- Click "Build a Cluster"
- Choose free tier M0
- Select your region
- Create cluster

### 3. Create Database User
- Click "Database Access"
- Add Database User
- Username: `admin`
- Password: (save this!)
- Role: readWrite

### 4. Whitelist IP
- Click "Network Access"
- Add IP Address
- Add: `0.0.0.0/0` (allow all - for testing only!)
- Or add your VPS IP for production

### 5. Get Connection String
- Click "Clusters"
- Click "Connect"
- Select "Connect your application"
- Copy connection string

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Set in Environment Variables

**VPS:**
```bash
MONGO_URI=mongodb+srv://admin:yourpassword@cluster.mongodb.net/manager-btaskee?retryWrites=true&w=majority
```

**Vercel/Railway/Render:**
- Add to environment variables in dashboard

### Test Connection

```bash
# Install mongosh
npm install -g mongosh

# Test
mongosh "mongodb+srv://admin:password@cluster.mongodb.net/manager-btaskee"

# Should connect without errors
```

---

**Security Tips:**
- Use strong password (20+ chars)
- Whitelist only necessary IPs in production
- Enable 2FA on MongoDB Atlas account
- Rotate credentials regularly
- Never hardcode connection string
