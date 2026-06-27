import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const user = await base44.auth.me();
        
        // Redirect based on role
        if (user.role === "user") {
          navigate(createPageUrl("StudentDashboard"));
        } else if (user.role === "admin") {
          navigate(createPageUrl("AdminDashboard"));
        } else {
          navigate(createPageUrl("HODDashboard"));
        }
      } catch (error) {
        // User not logged in, redirect to home
        navigate(createPageUrl("Home"));
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}