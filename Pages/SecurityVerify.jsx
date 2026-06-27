import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ScanLine, CheckCircle, XCircle, LogOut, LogIn, Search, User, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SecurityVerify() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [qrInput, setQrInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: approvedPasses = [] } = useQuery({
    queryKey: ["approvedPasses"],
    queryFn: () => base44.entities.GatePass.filter({ status: "approved" }, "-created_date"),
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["recentLogs"],
    queryFn: () => base44.entities.ExitLog.list("-created_date", 10),
  });

  const createLogMutation = useMutation({
    mutationFn: (logData) => base44.entities.ExitLog.create(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentLogs"] });
      setRemarks("");
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExitLog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentLogs"] });
    },
  });

  const handleVerify = () => {
    setVerificationResult(null);
    if (!qrInput.trim()) {
      setVerificationResult({ success: false, message: "Please enter a QR code" });
      return;
    }

    const foundPass = approvedPasses.find((pass) => pass.qrCode === qrInput.trim());
    
    if (foundPass) {
      setVerificationResult({ success: true, pass: foundPass });
    } else {
      setVerificationResult({
        success: false,
        message: "Invalid QR code or pass not approved",
      });
    }
  };

  const handleMarkExit = async () => {
    if (!verificationResult?.pass) return;

    const logData = {
      gatePassId: verificationResult.pass.id,
      studentName: verificationResult.pass.studentName,
      rollNo: verificationResult.pass.rollNo,
      exitTime: new Date().toISOString(),
      verifiedBy: user?.email,
      status: "exited",
      remarks: remarks,
    };

    await createLogMutation.mutateAsync(logData);
    setVerificationResult(null);
    setQrInput("");
  };

  const handleMarkEntry = async (log) => {
    await updateLogMutation.mutateAsync({
      id: log.id,
      data: {
        entryTime: new Date().toISOString(),
        status: "returned",
      },
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Verification</h1>
          <p className="text-gray-600 mt-1">Scan and verify student gate passes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* QR Verification Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-blue-600" />
                Verify Gate Pass
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">QR Code / Pass ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="qrCode"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Scan or enter QR code"
                    onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                  />
                  <Button onClick={handleVerify} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>

              {verificationResult && (
                <>
                  {verificationResult.success ? (
                    <Alert className="border-green-300 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-900">
                        <div className="font-semibold mb-2">✓ Valid Gate Pass</div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Student:</strong> {verificationResult.pass.studentName}
                          </p>
                          <p>
                            <strong>Roll No:</strong> {verificationResult.pass.rollNo}
                          </p>
                          <p>
                            <strong>Branch:</strong> {verificationResult.pass.branch} -{" "}
                            {verificationResult.pass.year}
                          </p>
                          <p>
                            <strong>Reason:</strong> {verificationResult.pass.reason}
                          </p>
                          <p>
                            <strong>Destination:</strong> {verificationResult.pass.destination}
                          </p>
                          <p>
                            <strong>Expected Return:</strong>{" "}
                            {verificationResult.pass.expectedReturn}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="w-4 h-4" />
                      <AlertDescription>{verificationResult.message}</AlertDescription>
                    </Alert>
                  )}

                  {verificationResult.success && (
                    <div className="space-y-3 pt-4 border-t">
                      <Label htmlFor="remarks">Remarks (Optional)</Label>
                      <Textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Any observations or notes..."
                        rows={3}
                      />
                      <Button
                        onClick={handleMarkExit}
                        disabled={createLogMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Mark Exit
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    No recent activity
                  </div>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {log.studentName}
                            </span>
                            <Badge
                              className={
                                log.status === "exited"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {log.status === "exited" ? "Out" : "Returned"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Roll No: {log.rollNo}</p>
                            <p>
                              Exit: {format(new Date(log.exitTime), "MMM dd, yyyy 'at' hh:mm a")}
                            </p>
                            {log.entryTime && (
                              <p>
                                Entry:{" "}
                                {format(new Date(log.entryTime), "MMM dd, yyyy 'at' hh:mm a")}
                              </p>
                            )}
                            {log.remarks && (
                              <p className="text-gray-500 italic">Note: {log.remarks}</p>
                            )}
                          </div>
                        </div>
                        {log.status === "exited" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkEntry(log)}
                            disabled={updateLogMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <LogIn className="w-4 h-4 mr-1" />
                            Mark Entry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Approved Passes */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>All Approved Passes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      QR Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {approvedPasses.map((pass) => (
                    <tr key={pass.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {pass.studentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pass.rollNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pass.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(pass.dateOfLeaving), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {pass.qrCode}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}