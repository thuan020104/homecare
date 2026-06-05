const express = require('express')
const route = express.Router()
const { createEmployee, loginEmployee, getAllEmployees, syncCustomer, getCurrentUser, logoutEmployee } = require('../controllers/AuthController')
const verifyToken = require('../middleware/authMiddleware')

route.post('/register', createEmployee)
route.post('/login', loginEmployee)
route.get('/getall', getAllEmployees)
route.post("/sync", syncCustomer);

// ✅ NEW: Protected routes with token verification
route.get('/me', verifyToken, getCurrentUser);
route.post('/logout', verifyToken, logoutEmployee);

module.exports = route