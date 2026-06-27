import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { History, LogOut, LogIn, User, Clock } from "lucide-react";

export default function ExitLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["exitLogs"],
    queryFn: () => base44.entities.ExitLog.list("-created_date"),
  });

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exit & Entry Logs</h1>
          <p className="text-gray-600 mt-1">Complete history of student movements</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              All Logs ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Roll No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Exit Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Entry Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Verified By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{log.studentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.rollNo}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <LogOut className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-700">
                              {format(new Date(log.exitTime), "MMM dd, yyyy")}
                            </span>
                            <span className="text-gray-500">
                              {format(new Date(log.exitTime), "hh:mm a")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {log.entryTime ? (
                            <div className="flex items-center gap-2 text-sm">
                              <LogIn className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">
                                {format(new Date(log.entryTime), "MMM dd, yyyy")}
                              </span>
                              <span className="text-gray-500">
                                {format(new Date(log.entryTime), "hh:mm a")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not yet returned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              log.status === "exited"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {log.status === "exited" ? "Out" : "Returned"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.verifiedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}