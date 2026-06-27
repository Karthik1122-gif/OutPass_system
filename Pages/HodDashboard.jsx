import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";

export default function HODDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: allPasses = [] } = useQuery({
    queryKey: ["allGatePasses"],
    queryFn: () => base44.entities.GatePass.list("-created_date"),
  });

  const stats = {
    total: allPasses.length,
    pending: allPasses.filter((p) => p.status === "pending").length,
    approved: allPasses.filter((p) => p.status === "approved").length,
    rejected: allPasses.filter((p) => p.status === "rejected").length,
    today: allPasses.filter((p) => isToday(new Date(p.created_date))).length,
    thisWeek: allPasses.filter((p) => isThisWeek(new Date(p.created_date))).length,
    thisMonth: allPasses.filter((p) => isThisMonth(new Date(p.created_date))).length,
    myApprovals: allPasses.filter((p) => p.approvedBy === user?.email).length,
  };

  const pendingPasses = allPasses.filter((p) => p.status === "pending").slice(0, 5);
  const urgentPending = allPasses.filter((p) => {
    if (p.status !== "pending") return false;
    const leaveDate = new Date(p.dateOfLeaving);
    const today = new Date();
    const diffTime = leaveDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1; // Leaving today or tomorrow
  });

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
            <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard 🎓</h1>
            <p className="text-gray-600 mt-1">
              Review and approve student gate pass requests
            </p>
          </div>
          <Link to={createPageUrl("HODApproval")}>
            <Button className="bg-slate-800 hover:bg-slate-900 shadow-lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approval Center
            </Button>
          </Link>
        </div>

        {/* Urgent Alert */}
        {urgentPending.length > 0 && (
          <Alert className="border-red-300 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">
              <span className="font-semibold">Urgent:</span> {urgentPending.length} student
              {urgentPending.length > 1 ? "s" : ""} need approval for passes leaving today or
              tomorrow!{" "}
              <Link to={createPageUrl("HODApproval")} className="underline font-semibold">
                Review Now
              </Link>
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
              <p className="text-xs opacity-80 mt-1">All applications</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.pending}</div>
              <p className="text-xs opacity-80 mt-1">Need your approval</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.approved}</div>
              <p className="text-xs opacity-80 mt-1">Successfully approved</p>
            </CardContent>
          </Card>

          <Card className="bg-red-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.rejected}</div>
              <p className="text-xs opacity-80 mt-1">Not approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Of all requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.thisWeek}</div>
              <p className="text-xs text-gray-500 mt-1">New requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.today}</div>
              <p className="text-xs text-gray-500 mt-1">New requests</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">My Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.myApprovals}</div>
              <p className="text-xs text-gray-500 mt-1">Processed by you</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl("HODApproval")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-yellow-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Pending ({stats.pending})</h3>
                  <p className="text-sm text-gray-600">Review pending requests</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Approved ({stats.approved})</h3>
                <p className="text-sm text-gray-600">Successfully processed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">This Month ({stats.thisMonth})</h3>
                <p className="text-sm text-gray-600">Total applications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Pending Approvals ({stats.pending})
              </CardTitle>
              <Link to={createPageUrl("HODApproval")}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingPasses.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">All caught up! No pending requests.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingPasses.map((pass) => {
                  const leaveDate = new Date(pass.dateOfLeaving);
                  const isUrgent =
                    Math.ceil((leaveDate - new Date()) / (1000 * 60 * 60 * 24)) <= 1;

                  return (
                    <div
                      key={pass.id}
                      className={`p-4 transition-colors ${
                        isUrgent ? "bg-red-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{pass.studentName}</span>
                            <Badge className={`${getStatusColor(pass.status)} border`}>
                              {pass.status.toUpperCase()}
                            </Badge>
                            {isUrgent && (
                              <Badge className="bg-red-600 text-white">URGENT</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Reason:</strong> {pass.reason}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>Roll: {pass.rollNo}</span>
                            <span>•</span>
                            <span>{pass.branch}</span>
                            <span>•</span>
                            <span>Leaving: {format(new Date(pass.dateOfLeaving), "MMM dd, yyyy")}</span>
                            <span>•</span>
                            <span>Applied: {format(new Date(pass.created_date), "MMM dd")}</span>
                          </div>
                        </div>
                        <Link to={createPageUrl("HODApproval")}>
                          <Button
                            size="sm"
                            className={
                              isUrgent
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }
                          >
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}