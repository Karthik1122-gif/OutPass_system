import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  AlertCircle,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, isThisMonth } from "date-fns";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: myPasses = [] } = useQuery({
    queryKey: ["myGatePasses", user?.email],
    queryFn: () =>
      user ? base44.entities.GatePass.filter({ created_by: user.email }, "-created_date") : [],
    enabled: !!user,
  });

  const stats = {
    total: myPasses.length,
    pending: myPasses.filter((p) => p.status === "pending").length,
    approved: myPasses.filter((p) => p.status === "approved").length,
    rejected: myPasses.filter((p) => p.status === "rejected").length,
    thisMonth: myPasses.filter((p) => isThisMonth(new Date(p.created_date))).length,
  };

  const needsProfile = user && (!user.rollNo || !user.branch || !user.year);
  const recentPasses = myPasses.slice(0, 5);
  const latestPending = myPasses.find((p) => p.status === "pending");

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.full_name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Student Dashboard - Manage your gate passes</p>
          </div>
          <Link to={createPageUrl("ApplyPass")}>
            <Button 
              className="bg-slate-800 hover:bg-slate-900 shadow-lg"
              disabled={needsProfile}
            >
              <Plus className="w-4 h-4 mr-2" />
              Apply for Gate Pass
            </Button>
          </Link>
        </div>

        {/* Profile Alert */}
        {needsProfile && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <span className="font-semibold">Complete your profile:</span> Please update your
              Roll Number, Branch, and Year in your{" "}
              <Link to={createPageUrl("Profile")} className="underline font-semibold">
                Profile Settings
              </Link>{" "}
              to apply for gate passes.
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Status Alert */}
        {latestPending && (
          <Alert className="border-yellow-300 bg-yellow-50">
            <Clock className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <span className="font-semibold">Pass Under Review:</span> Your gate pass request for{" "}
              "{latestPending.reason}" is pending HOD approval.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.total}</div>
              <p className="text-xs opacity-80 mt-1">All time applications</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.pending}</div>
              <p className="text-xs opacity-80 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.approved}</div>
              <p className="text-xs opacity-80 mt-1">Ready to use</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs opacity-80 mt-1">Passes applied</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.total > 0
                  ? Math.round((stats.approved / stats.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">Of all your requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Rejection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.total > 0
                  ? Math.round((stats.rejected / stats.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">Of all your requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.pending > 0 ? "Pending" : "Fast"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average approval time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl("ApplyPass")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">New Application</h3>
                  <p className="text-sm text-gray-600">Apply for a new gate pass</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("PassHistory")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">View History</h3>
                  <p className="text-sm text-gray-600">Check all your applications</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Profile")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">My Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Applications */}
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Recent Applications
              </CardTitle>
              <Link to={createPageUrl("PassHistory")}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentPasses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven't applied for any gate passes yet</p>
                <Link to={createPageUrl("ApplyPass")}>
                  <Button className="bg-slate-800 hover:bg-slate-900" disabled={needsProfile}>
                    Apply for Your First Pass
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {recentPasses.map((pass) => (
                  <div key={pass.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${getStatusColor(pass.status)} border`}>
                            {pass.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(pass.created_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          <strong>Reason:</strong> {pass.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          Destination: {pass.destination} • Leaving:{" "}
                          {format(new Date(pass.dateOfLeaving), "MMM dd")} at {pass.timeOfLeaving}
                        </p>
                        {pass.hodRemarks && (
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                            <strong>Remarks:</strong> {pass.hodRemarks}
                          </p>
                        )}
                      </div>
                      {pass.status === "approved" && (
                        <Link to={createPageUrl("PassHistory")}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            View Pass
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}