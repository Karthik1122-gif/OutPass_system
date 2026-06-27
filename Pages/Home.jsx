import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, GraduationCap, UserCheck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
        // User not logged in, show landing page
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Campus Gate Pass System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Digital gate pass management for students, faculty, and security personnel
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">Students</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Apply for gate passes online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Track application status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Download QR codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>View pass history</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300">
            <CardHeader className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">HOD / Faculty</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">✓</span>
                  <span>Review student requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">✓</span>
                  <span>Approve or reject passes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">✓</span>
                  <span>Add remarks and notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">✓</span>
                  <span>View department analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">Security / Admin</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Verify gate passes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Scan QR codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Mark entry/exit times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>View complete logs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Paperless Process</h3>
                <p className="text-sm text-gray-600">
                  Completely digital workflow, no physical forms needed
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Real-time Updates</h3>
                <p className="text-sm text-gray-600">
                  Instant notifications on approval status
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Authentication</h3>
                <p className="text-sm text-gray-600">
                  Role-based access control for data security
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Analytics & Reports</h3>
                <p className="text-sm text-gray-600">
                  Complete audit trail and statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            To access the system, please contact your administrator for account setup
          </p>
        </div>
      </div>
    </div>
  );
}