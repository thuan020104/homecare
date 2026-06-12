# 🎯 Render Backend Deployment - Hướng Dẫn Chi Tiết

## 📋 Điều kiện tiên quyết

✅ Đã có tài khoản Render + GitHub  
✅ MongoDB Atlas connection string (có dạng: `mongodb+srv://dbadmin:PASSWORD@...`)  
✅ Code đã push lên GitHub (branch `main`)  

---

## 🚀 STEP 1: Tạo Render Account

### 1.1 Vào Render
```
https://render.com
```

### 1.2 Click "Sign Up"
- Chọn **"Continue with GitHub"**
- Authorize Render để access GitHub repositories
- Render sẽ redirect lại trang chủ

### 1.3 Dashboard
Bạn sẽ thấy trang chủ Render với nút **"New +"** ở góc trên phải.

---

## ✍️ STEP 2: Tạo Web Service mới

### 2.1 Click "New +"
Ở góc trên bên phải, click nút **"New +"**

### 2.2 Chọn "Web Service"
Một menu sẽ xuất hiện:
```
- Web Service       ← CHỌN CÁI NÀY
- Static Site
- Postgres
- MySQL
- Redis
- Private Service
```

### 2.3 Kết nối GitHub Repository
Sau khi click **"Web Service"**:

**Bạn sẽ thấy:**
```
┌─────────────────────────────────────┐
│ Connect a repository                │
│                                     │
│ Your repositories:                  │
│ □ DACNPM                            │ ← Click chọn cái này
│ □ other-repo                        │
│                                     │
│ [Connect GitHub Account]            │
└─────────────────────────────────────┘
```

- Tìm repository `DACNPM` của bạn
- Click nó

---

## ⚙️ STEP 3: Cấu hình Web Service

Sau khi chọn repo, bạn sẽ thấy form với các trường:

### 3.1 Name (Tên service)
```
Field: Name
Current: DACNPM (auto-filled)
Change to: dacnpm-backend

⚠️ Quan trọng: Phải là tên duy nhất!
   Nếu có người khác dùng, sẽ báo lỗi.
   Hãy thêm số hoặc chữ cái độc nhất.

Ví dụ:
- dacnpm-backend-v1
- dacnpm-backend-2024
- yourname-dacnpm-backend
```

✅ **Làm: Nhập tên**

---

### 3.2 Root Directory
```
Field: Root Directory
Current: (empty)
Change to: backend

⚠️ QUAN TRỌNG!
   Nếu không set, Render sẽ build project root.
   Nhưng backend nằm trong thư mục "backend/"
   Nên phải chỉ định "backend"
```

**Cách set:**
1. Click vào field "Root Directory"
2. Xóa cái gì có sẵn (nếu có)
3. Type: `backend`

✅ **Làm: Set Root Directory = backend**

---

### 3.3 Runtime
```
Field: Runtime
Current: (auto-detect)
Change to: Node

Render sẽ tự detect Node.js.
Nếu không detect, chọn "Node" từ dropdown.
```

✅ **Làm: Confirm Runtime = Node**

---

### 3.4 Build Command
```
Field: Build Command
Current: (auto-detect)
Should be: npm install

⚠️ Render sẽ tự detect "npm install" hay "yarn install"
   Nếu sai, hãy set thành:
   npm install
```

✅ **Làm: Set Build Command = npm install**

---

### 3.5 Start Command ⭐ QUAN TRỌNG
```
Field: Start Command
Current: (auto-detect)
Should be: npm start

⚠️ KỲ DỌNG!
   Render cần biết lệnh chạy app.
   Backend cần "npm start" (không phải "npm run dev")
   
   backend/package.json phải có:
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon --inspect index.js"
   }
```

**Nếu backend không có "start" script:**

```bash
# Chạy lệnh này để thêm vào backend/package.json:
cd backend
npm pkg set scripts.start="node index.js"
git add .
git commit -m "chore: add start script"
git push origin main
```

✅ **Làm: Set Start Command = npm start**

---

### 3.6 Port
```
Field: Port (nếu có)
Current: (empty)
Should be: 5000

⚠️ Backend đang listen ở port 5000
   Render sẽ expose ngoài tự động
   Không cần thay đổi
```

✅ **Confirm: Port = 5000** (default)

---

## 🔐 STEP 4: Thêm Environment Variables

Scroll xuống dưới, bạn sẽ thấy section **"Environment"**

### 4.1 Tìm Environment Section
```
[Build Command: npm install]
[Start Command: npm start]
[Port: 5000]

▼ Environment              ← Scroll xuống xem cái này
```

### 4.2 Click "Add Environment Variable"
Nút này để thêm từng biến một.

### 4.3 Thêm từng biến theo thứ tự:

#### 4.3.1 MONGO_URI
```
Key: MONGO_URI
Value: mongodb+srv://dbadmin:YOUR_PASSWORD@cluster.mongodb.net/manager-btaskee?retryWrites=true&w=majority

⚠️ Thay YOUR_PASSWORD bằng password MongoDB Atlas của bạn
   Ví dụ: Abc123!@#Xyz789
   
   Full example:
   mongodb+srv://dbadmin:Abc123!@#Xyz789@cluster0.mongodb.net/manager-btaskee?retryWrites=true&w=majority
```

**Cách dán:**
1. Lấy connection string từ MongoDB Atlas
2. Copy nó
3. Paste vào field "Value"
4. Thay PASSWORD
5. Click "Add"

✅ **Làm: Thêm MONGO_URI**

---

#### 4.3.2 JWT_SECRET
```
Key: JWT_SECRET
Value: sk_prod_dacnpm_2024_super_secret_min_32_characters_long_abc123xyz

⚠️ QUAN TRỌNG!
   - Phải có ít nhất 32 ký tự
   - Dùng ký tự hỗn hợp (chữ, số, đặc biệt)
   - Không dùng lại secret trong code gốc
   - Mỗi environment khác nhau
   
Gợi ý generate:
- Dùng: https://www.uuidgenerator.net/
- Hoặc terminal:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

✅ **Làm: Thêm JWT_SECRET**

---

#### 4.3.3 MOMO_PARTNER_CODE
```
Key: MOMO_PARTNER_CODE
Value: MOMO

(Không cần thay, dùng cái này)
```

✅ **Làm: Thêm MOMO_PARTNER_CODE = MOMO**

---

#### 4.3.4 MOMO_ACCESS_KEY
```
Key: MOMO_ACCESS_KEY
Value: F8BBA842ECF85

(Để nguyên)
```

✅ **Làm: Thêm MOMO_ACCESS_KEY**

---

#### 4.3.5 MOMO_SECRET_KEY
```
Key: MOMO_SECRET_KEY
Value: K951B6PE1waDMi640xX08PD3vg6EkVlz

(Để nguyên)
```

✅ **Làm: Thêm MOMO_SECRET_KEY**

---

#### 4.3.6 MOMO_REDIRECT_URL
```
Key: MOMO_REDIRECT_URL
Value: (CHƯA BIẾT, để sau)

⚠️ Cần URL frontend Render
   Bạn sẽ deploy frontend sau
   Thêm cái này sau!
   
Tạm thời set:
Value: http://localhost:5173/orders-success

Sau deploy frontend, quay lại update!
```

✅ **Làm: Thêm MOMO_REDIRECT_URL (tạm)**

---

#### 4.3.7 MOMO_IPN_URL
```
Key: MOMO_IPN_URL
Value: (CHƯA BIẾT, để sau)

⚠️ Cần URL backend Render
   Backend sẽ generate URL sau khi deploy
   
Render sẽ cấp URL tự động, ví dụ:
https://dacnpm-backend.onrender.com

Tạm thời set:
Value: http://localhost:5000/api/momo/callback

Sau deploy backend, quay lại update!
```

✅ **Làm: Thêm MOMO_IPN_URL (tạm)**

---

#### 4.3.8 NODE_ENV
```
Key: NODE_ENV
Value: production

(Để nguyên)
```

✅ **Làm: Thêm NODE_ENV = production**

---

## ✅ Kiểm tra lại

Trước khi click "Create", kiểm tra:

```
☑️ Name: dacnpm-backend (unique)
☑️ Root Directory: backend
☑️ Runtime: Node
☑️ Build Command: npm install
☑️ Start Command: npm start
☑️ Environment variables: 8 cái đã thêm
   ☑️ MONGO_URI
   ☑️ JWT_SECRET
   ☑️ MOMO_PARTNER_CODE
   ☑️ MOMO_ACCESS_KEY
   ☑️ MOMO_SECRET_KEY
   ☑️ MOMO_REDIRECT_URL (tạm)
   ☑️ MOMO_IPN_URL (tạm)
   ☑️ NODE_ENV
```

---

## 🚀 STEP 5: Click "Create Web Service"

Scroll xuống dưới cùng, click nút xanh:
```
[Cancel] [Create Web Service]
                    ↑
                 Click đây
```

---

## ⏳ STEP 6: Chờ Deploy

Bạn sẽ thấy:
```
┌─────────────────────────────────────┐
│ dacnpm-backend                      │
│                                     │
│ ⏳ Building...                       │
│                                     │
│ Logs:                               │
│ → Building Docker image...          │
│ → Installing dependencies...        │
│ → Running npm install...            │
│ ...                                 │
│ → Server started on port 5000       │
│                                     │
│ ✅ Deployment successful!           │
│                                     │
│ URL: https://dacnpm-backend...      │ ← BACKEND URL!
└─────────────────────────────────────┘
```

**Quá trình:**
- Build: 1-2 phút
- Deploy: 1-2 phút
- Tổng: 2-5 phút

---

## 📌 Sau khi Deploy xong

### 6.1 Lấy Backend URL
```
Render Dashboard > dacnpm-backend > Copy URL

Ví dụ:
https://dacnpm-backend.onrender.com
```

### 6.2 Test Backend
```bash
# Terminal
curl https://dacnpm-backend.onrender.com/api/auth/getall

# Hoặc browser
https://dacnpm-backend.onrender.com/api/auth/getall

# Sẽ trả về:
# [] (mảng rỗng hoặc danh sách employees)
```

✅ **Nếu thành công = Backend Deploy OK!**

---

## ❌ Nếu có lỗi

### Lỗi "Build failed"
1. Click vào service
2. Click "Logs" tab
3. Tìm dòng error
4. Phổ biến:
   - `npm start not found` → Add start script
   - `Cannot find module` → package.json sai

### Lỗi "Application failed to start"
1. Check logs
2. Thường là MONGO_URI sai
3. Test locally trước:
   ```bash
   cd backend
   npm install
   MONGO_URI="your-uri" npm start
   ```

### Lỗi "Cannot connect to database"
1. Check MongoDB Atlas IP whitelist
2. Thêm `0.0.0.0/0` (allow all)
3. Check password khớp với connection string

---

## 🎉 Hoàn thành!

✅ Backend đã deploy trên Render  
✅ Có URL public  
✅ Sẵn sàng cho frontend  

---

## 📝 Note Quan Trọng

**Sau khi Deploy Frontend**, cần update lại:
- MOMO_REDIRECT_URL = frontend URL
- MOMO_IPN_URL = backend URL (nếu generate sau)

**Cách update:**
1. Render Dashboard > dacnpm-backend
2. Go to Environment
3. Click biến cần sửa
4. Update value
5. Click "Save"
6. Service sẽ auto redeploy

---

**Bạn đã sẵn sàng! Deploy thôi! 🚀**
