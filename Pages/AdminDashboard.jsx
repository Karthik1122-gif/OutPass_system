import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Shield,
  ScanLine,
  LogOut,
  LogIn,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, isToday } from "date-fns";

export default function AdminDashboard() {
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

  const { data: logs = [] } = useQuery({
    queryKey: ["exitLogs"],
    queryFn: () => base44.entities.ExitLog.list("-created_date"),
  });

  const stats = {
    approvedPasses: allPasses.filter((p) => p.status === "approved").length,
    pendingApprovals: allPasses.filter((p) => p.status === "pending").length,
    studentsOut: logs.filter((l) => l.status === "exited").length,
    totalLogs: logs.length,
    todayLogs: logs.filter((l) => isToday(new Date(l.created_date))).length,
    todayApproved: allPasses.filter(
      (p) => p.status === "approved" && isToday(new Date(p.approvedDate))
    ).length,
  };

  const recentActivity = logs.slice(0, 5);
  const studentsCurrentlyOut = logs.filter((l) => l.status === "exited");

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin & Security Dashboard 🔐</h1>
            <p className="text-gray-600 mt-1">
              Manage approvals, verify passes, and monitor campus activity
            </p>
          </div>
          <Link to={createPageUrl("SecurityVerify")}>
            <Button className="bg-slate-800 hover:bg-slate-900 shadow-lg">
              <ScanLine className="w-4 h-4 mr-2" />
              Verify Gate Pass
            </Button>
          </Link>
        </div>

        {/* Alert for students out */}
        {stats.studentsOut > 0 && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              <span className="font-semibold">{stats.studentsOut} student
              {stats.studentsOut > 1 ? "s are" : " is"} currently outside campus.</span>{" "}
              <Link to={createPageUrl("ExitLogs")} className="underline font-semibold">
                View Details
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved Passes</CardTitle>
              <CheckCircle className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.approvedPasses}</div>
              <p className="text-xs opacity-80 mt-1">Active gate passes</p>
            </CardContent>
          </Card>

          <Card className="bg-amber-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs opacity-80 mt-1">Need approval</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students Out</CardTitle>
              <LogOut className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.studentsOut}</div>
              <p className="text-xs opacity-80 mt-1">Currently outside</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="w-5 h-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalLogs}</div>
              <p className="text-xs opacity-80 mt-1">Entry/exit records</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.todayLogs}</div>
              <p className="text-xs text-gray-500 mt-1">Gate movements</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Today's Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.todayApproved}</div>
              <p className="text-xs text-gray-500 mt-1">Passes approved</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Verification Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.approvedPasses > 0
                  ? Math.round((stats.totalLogs / stats.approvedPasses) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">Pass usage</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Return Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                {stats.totalLogs > 0
                  ? Math.round(
                      ((stats.totalLogs - stats.studentsOut) / stats.totalLogs) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">Students returned</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl("HODApproval")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Approve Requests</h3>
                  <p className="text-sm text-gray-600">
                    {stats.pendingApprovals} pending applications
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("SecurityVerify")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Verify Pass</h3>
                  <p className="text-sm text-gray-600">Scan and verify gate passes</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("ExitLogs")} className="block">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-300 cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">View Logs</h3>
                  <p className="text-sm text-gray-600">{stats.totalLogs} total records</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Students Currently Out */}
        {studentsCurrentlyOut.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader className="border-b bg-slate-100">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                Students Currently Outside Campus ({studentsCurrentlyOut.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-96 overflow-y-auto">
                {studentsCurrentlyOut.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{log.studentName}</span>
                          <Badge className="bg-orange-100 text-orange-800">
                            <LogOut className="w-3 h-3 mr-1" />
                            Out
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Roll No: {log.rollNo}</p>
                          <p>Exit: {format(new Date(log.exitTime), "MMM dd, yyyy 'at' hh:mm a")}</p>
                          {log.remarks && <p className="text-gray-500 italic">Note: {log.remarks}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-600" />
                Recent Gate Activity
              </CardTitle>
              <Link to={createPageUrl("ExitLogs")}>
                <Button variant="outline" size="sm">
                  View All Logs
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentActivity.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{log.studentName}</span>
                          <Badge
                            className={
                              log.status === "exited"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {log.status === "exited" ? (
                              <>
                                <LogOut className="w-3 h-3 mr-1" />
                                Out
                              </>
                            ) : (
                              <>
                                <LogIn className="w-3 h-3 mr-1" />
                                Returned
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Roll No: {log.rollNo}</p>
                          <p>Exit: {format(new Date(log.exitTime), "MMM dd, yyyy 'at' hh:mm a")}</p>
                          {log.entryTime && (
                            <p>Entry: {format(new Date(log.entryTime), "MMM dd, yyyy 'at' hh:mm a")}</p>
                          )}
                        </div>
                      </div>
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