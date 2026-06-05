import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProtectedRoute({ allowedRoles, redirectPath = "/manager-login" }) {
  const [isAuthorized, setIsAuthorized] = useState(null);  // null = loading, true/false = result
  const [user, setUser] = useState(null);

  // ✅ SECURITY FIX: Verify user authentication with backend (httpOnly cookie)
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true  // Send httpOnly cookie
        });
        
        if (res.data.employee && allowedRoles.includes(res.data.employee.role)) {
          setUser(res.data.employee);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        // Token invalid or not present
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, [allowedRoles]);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  // Authorized - render protected content
  return <Outlet context={{ user }} />;
}
