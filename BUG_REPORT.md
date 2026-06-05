# 🐛 Bug Report - DACNPM Project

## 10 Bugs Found

---

### **Bug #1: Undefined Variable in customerController.js**
**File:** [backend/controllers/customerController.js](backend/controllers/customerController.js#L7)  
**Severity:** 🔴 HIGH  
**Line:** 7

**Issue:**
```javascript
const customer = await Customer.create({ clerkId, name, email, phone, address, avatarUrl });
```

**Problem:** 
- `avatarUrl` is used in the create statement but is NOT destructured from `req.body`
- This will create records with `avatarUrl: undefined`
- The variable doesn't exist in the function scope

**Fix:**
```javascript
const { clerkId, name, email, phone, address, avatarUrl } = req.body;
// or remove avatarUrl if it's not needed
const customer = await Customer.create({ clerkId, name, email, phone, address });
```

---

### **Bug #2: Hardcoded API Credentials Exposed**
**File:** [backend/controllers/momoController.controller.js](backend/controllers/momoController.controller.js#L5-L7)  
**Severity:** 🔴 CRITICAL (Security Vulnerability)  
**Lines:** 5-8

**Issue:**
```javascript
const partnerCode = "MOMO";
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const redirectUrl = "http://localhost:5173/orders-susscess";
const ipnUrl = "https://fcd2b2d01c20.ngrok-free.app/api/momo/callback";
```

**Problem:**
- Sensitive credentials are hardcoded in source code
- These should NEVER be in version control
- Anyone with access to repo can use these credentials
- If ngrok URL is real, it's now exposed publicly

**Fix:**
```javascript
const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const redirectUrl = process.env.MOMO_REDIRECT_URL;
const ipnUrl = process.env.MOMO_IPN_URL;
```

Add to `.env` file and add `.env` to `.gitignore`

---

### **Bug #3: Weak JWT Secret with Insecure Default**
**File:** [backend/controllers/AuthController.js](backend/controllers/AuthController.js#L89)  
**Severity:** 🔴 CRITICAL (Security)  
**Line:** 89

**Issue:**
```javascript
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || "mysecretkey",  // ❌ DANGEROUS
  { expiresIn: "1d" }
);
```

**Problem:**
- Falls back to "mysecretkey" if environment variable is missing
- This default is hardcoded and well-known
- Production tokens can be forged if env var is missing
- No validation that JWT_SECRET is set

**Fix:**
```javascript
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not set"); })(),
  { expiresIn: "1d" }
);
```

Or better, fail at startup if missing:
```javascript
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

---

### **Bug #4: Insecure Session Storage for Authentication**
**File:** [client/src/components/ProtectedRoute.jsx](client/src/components/ProtectedRoute.jsx#L4)  
**Severity:** 🔴 HIGH (Security)  
**Line:** 4

**Issue:**
```javascript
const user = JSON.parse(sessionStorage.getItem("user"));
```

**Problem:**
- SessionStorage can be manipulated by client-side JavaScript
- User can open DevTools and change their role: `sessionStorage.setItem("user", JSON.stringify({role: "admin"}))`
- No server-side verification of user status
- Session data is accessible to XSS attacks

**Fix:**
1. Store authentication state in httpOnly cookies (sent server-only)
2. Use JWT in httpOnly cookies
3. Verify token on each protected route on backend
4. Use React Context with secure token management

---

### **Bug #5: Typo in Redirect URL - MoMo Payment**
**File:** [backend/controllers/momoController.controller.js](backend/controllers/momoController.controller.js#L8)  
**Severity:** 🟡 MEDIUM  
**Line:** 8

**Issue:**
```javascript
const redirectUrl = "http://localhost:5173/orders-susscess"; // typo: "susscess"
```

**Problem:**
- URL has typo: `susscess` instead of `success`
- Users will be redirected to non-existent route after payment
- Should redirect to correct order history or success page

**Fix:**
```javascript
const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:5173/orders-success";
```

---

### **Bug #6: Request Logging Middleware Positioned Incorrectly**
**File:** [backend/index.js](backend/index.js#L44-46)  
**Severity:** 🟡 MEDIUM  
**Lines:** 44-46

**Issue:**
```javascript
// Routes are registered here (lines 32-39)
app.use("/api/auth", userRoutes);
app.use("/api/services", serviceRoutes);
// ...

// Logging middleware is AFTER routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

**Problem:**
- Logging middleware runs AFTER routes are matched
- Won't log requests to registered routes
- Only logs requests to unmatched routes (404)

**Fix:**
Move logging middleware to the top, before route registration:
```javascript
app.use(morgan("dev")); // Already has this, good!
// Move this before routes:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

---

### **Bug #7: Missing Input Validation in customerController.js**
**File:** [backend/controllers/customerController.js](backend/controllers/customerController.js#L5-8)  
**Severity:** 🟡 MEDIUM  
**Lines:** 5-8

**Issue:**
```javascript
const createCustomer = async (req, res) => {
  try {
    const { clerkId, name, email, phone, address } = req.body;
    const exist = await Customer.findOne({ clerkId });
    if (exist) return res.status(400).json({ message: "Clerk ID đã tồn tại" });
    // No validation that clerkId exists or email is valid
    const customer = await Customer.create({ clerkId, name, email, phone, address, avatarUrl });
```

**Problem:**
- No validation that `clerkId` is provided
- No email format validation
- Missing `avatarUrl` in destructuring (Bug #1)
- No validation for empty strings

**Fix:**
```javascript
const createCustomer = async (req, res) => {
  try {
    const { clerkId, name, email, phone, address } = req.body;
    
    // Validation
    if (!clerkId || !name || !email) {
      return res.status(400).json({ message: "clerkId, name, and email are required" });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const exist = await Customer.findOne({ clerkId });
    if (exist) return res.status(400).json({ message: "Clerk ID đã tồn tại" });
    
    const customer = await Customer.create({ clerkId, name, email, phone, address });
```

---

### **Bug #8: Incorrect Route Logic in LoginAdmin.jsx**
**File:** [client/src/pages/admin/LoginAdmin.jsx](client/src/pages/admin/LoginAdmin.jsx#L42-55)  
**Severity:** 🟡 MEDIUM  
**Lines:** 42-55

**Issue:**
```javascript
if (user.role === "admin") navigate("/admin-dashboard", { replace: true });
else if (user.role === "manager") navigate("/manager-dashboard", { replace: true });
else navigate("/staff-dashboard", { replace: true });

// Later in useEffect:
if (user.role === "admin") navigate("/admin-dashboard", { replace: true });
else if (user.role === "staff") navigate("/staff-dashboard", { replace: true });
// Missing manager check here!
```

**Problem:**
- Inconsistent role handling between redirect and useEffect
- Manager role not checked in useEffect
- If manager is already logged in, useEffect won't redirect properly

**Fix:**
Make them consistent:
```javascript
const redirectByRole = (role) => {
  switch(role) {
    case "admin": return "/admin-dashboard";
    case "manager": return "/manager-dashboard";
    case "staff": return "/staff-dashboard";
    default: return "/";
  }
};

// Use in both places:
navigate(redirectByRole(user.role), { replace: true });
```

---

### **Bug #9: Wrong Component Import and Endpoint in AddCutomers.jsx**
**File:** [client/src/pages/admin/AddCutomers.jsx](client/src/pages/admin/AddCutomers.jsx#L4)  
**Severity:** 🟡 MEDIUM  
**Lines:** 4, 24

**Issue:**
```javascript
import EmployeeForm from "../../components/admin/CustomerForm"; // ❌ Wrong!

export default function AddCutomers() {
  // ...
  const handleSubmit = async (data) => {
    await axios.post("http://localhost:5000/api/auth/create", data); // ❌ Employee endpoint!
```

**Problem:**
- File is named `AddCutomers` and imports `CustomerForm`
- But imports `EmployeeForm` instead
- Uses `/api/auth/create` endpoint which creates employees, not customers
- Comment says "Thêm nhân viên" (add employee) but file is for customers
- Confusion between customer and employee creation

**Fix:**
Either:
1. Change to add customers:
```javascript
import CustomerForm from "../../components/admin/CustomerForm";
await axios.post("http://localhost:5000/api/customers/create", data);
```

Or rename file to `AddEmployees.jsx` and use employee endpoint consistently.

---

### **Bug #10: Missing Error Handling for Price Display**
**File:** [client/src/pages/customer/Service.jsx](client/src/pages/customer/Service.jsx#L77)  
**Severity:** 🟡 MEDIUM  
**Line:** 77

**Issue:**
```javascript
<p className="font-bold text-teal-600 text-2xl text-center mb-4">
  {service.price.toLocaleString()}đ
</p>
```

**Problem:**
- If `service.price` is undefined or null, will throw "Cannot read property 'toLocaleString' of undefined"
- No validation that service.price is a valid number
- Could display "NaNđ" if price is not a number
- No fallback for missing data

**Fix:**
```javascript
<p className="font-bold text-teal-600 text-2xl text-center mb-4">
  {(service?.price ? service.price.toLocaleString() : "Liên hệ")}đ
</p>
```

Or safer:
```javascript
<p className="font-bold text-teal-600 text-2xl text-center mb-4">
  {typeof service?.price === 'number' ? `${service.price.toLocaleString()}đ` : "Liên hệ"}
</p>
```

---

## Summary Table

| # | Severity | File | Issue | Type |
|---|----------|------|-------|------|
| 1 | 🔴 HIGH | customerController.js | Undefined `avatarUrl` variable | Logic Error |
| 2 | 🔴 CRITICAL | momoController.js | Hardcoded credentials exposed | Security |
| 3 | 🔴 CRITICAL | AuthController.js | Weak JWT secret default | Security |
| 4 | 🔴 HIGH | ProtectedRoute.jsx | Insecure sessionStorage auth | Security |
| 5 | 🟡 MEDIUM | momoController.js | Typo in redirect URL | Logic Error |
| 6 | 🟡 MEDIUM | index.js | Logging middleware position | Logic Error |
| 7 | 🟡 MEDIUM | customerController.js | Missing input validation | Data Validation |
| 8 | 🟡 MEDIUM | LoginAdmin.jsx | Inconsistent role handling | Logic Error |
| 9 | 🟡 MEDIUM | AddCutomers.jsx | Wrong component/endpoint | Logic Error |
| 10 | 🟡 MEDIUM | Service.jsx | Missing error handling for price | Runtime Error |

---

## Recommendations

**High Priority (Implement Immediately):**
1. ✅ Fix hardcoded credentials (Bug #2)
2. ✅ Fix weak JWT secret (Bug #3)
3. ✅ Fix authentication storage (Bug #4)

**Medium Priority (Implement Soon):**
4. ✅ Fix undefined variable (Bug #1)
5. ✅ Add input validation (Bug #7)
6. ✅ Fix remaining bugs

**Preventive Measures:**
- Add environment variable validation at startup
- Implement request/response validation middleware
- Use TypeScript or JSDoc for type safety
- Add unit tests for critical functions
- Use ESLint with security rules
- Add pre-commit hooks for sensitive data detection
