// ✅ Middleware to verify JWT token from httpOnly cookie or Authorization header
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    let token = null;

    // ✅ Check Authorization header first (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // ✅ If no token in header, check cookies
    // Note: httpOnly cookies are automatically sent by browser with withCredentials: true
    // But we need to access them via req.cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        message: "No authentication token provided",
        error: "Missing token"
      });
    }

    // ✅ Verify token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ 
        message: "Server configuration error",
        error: "JWT_SECRET not set"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Attach user info to request
    next();

  } catch (err) {
    console.error("Token verification failed:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired",
        error: "Please login again"
      });
    }
    
    return res.status(401).json({ 
      message: "Invalid token",
      error: err.message
    });
  }
};

module.exports = verifyToken;
