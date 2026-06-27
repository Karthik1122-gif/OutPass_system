import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Search, Filter, CheckCircle, XCircle, Calendar, Clock, MapPin, User, Phone } from "lucide-react";
import ApprovalModal from "../components/approval/ApprovalModal";

export default function HODApproval() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: passes = [], isLoading } = useQuery({
    queryKey: ["allGatePasses"],
    queryFn: () => base44.entities.GatePass.list("-created_date"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }) => {
      const qrData = `GATEPASS-${id}-${Date.now()}`;
      return base44.entities.GatePass.update(id, {
        status: "approved",
        hodRemarks: remarks,
        approvedBy: user?.email,
        approvedDate: new Date().toISOString(),
        qrCode: qrData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGatePasses"] });
      setSelectedPass(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }) =>
      base44.entities.GatePass.update(id, {
        status: "rejected",
        hodRemarks: remarks,
        approvedBy: user?.email,
        approvedDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGatePasses"] });
      setSelectedPass(null);
    },
  });

  const filteredPasses = passes
    .filter((pass) => {
      if (filter === "all") return true;
      return pass.status === filter;
    })
    .filter((pass) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        pass.studentName?.toLowerCase().includes(query) ||
        pass.rollNo?.toLowerCase().includes(query) ||
        pass.branch?.toLowerCase().includes(query) ||
        pass.reason?.toLowerCase().includes(query)
      );
    });

  const stats = {
    pending: passes.filter((p) => p.status === "pending").length,
    approved: passes.filter((p) => p.status === "approved").length,
    rejected: passes.filter((p) => p.status === "rejected").length,
  };

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
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gate Pass Approvals</h1>
          <p className="text-gray-600 mt-1">Review and process student gate pass requests</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending Approval</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
              <div className="text-sm text-green-700">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
              <div className="text-sm text-red-700">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, roll no, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Passes List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : filteredPasses.length === 0 ? (
          <Card className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No requests found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPasses.map((pass) => (
              <Card key={pass.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${getStatusColor(pass.status)} border`}>
                          {pass.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Applied {format(new Date(pass.created_date), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <span className="font-semibold text-gray-900">{pass.studentName}</span>
                            <span className="text-gray-600 ml-2">({pass.rollNo})</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {pass.branch} - {pass.year}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {pass.contact}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Reason:</p>
                        <p className="text-sm text-gray-700">{pass.reason}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>Destination: {pass.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Leaving: {format(new Date(pass.dateOfLeaving), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Time: {pass.timeOfLeaving}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Return: {pass.expectedReturn}</span>
                        </div>
                      </div>

                      {pass.hodRemarks && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            {pass.status === "approved" ? "Approval" : "Rejection"} Remarks:
                          </p>
                          <p className="text-sm text-gray-600">{pass.hodRemarks}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {pass.approvedBy} on{" "}
                            {format(new Date(pass.approvedDate), "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                        </div>
                      )}
                    </div>

                    {pass.status === "pending" && (
                      <div className="flex flex-col gap-2 lg:min-w-[120px]">
                        <Button
                          onClick={() => setSelectedPass({ ...pass, action: "approve" })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => setSelectedPass({ ...pass, action: "reject" })}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedPass && (
          <ApprovalModal
            pass={selectedPass}
            onApprove={(remarks) => approveMutation.mutate({ id: selectedPass.id, remarks })}
            onReject={(remarks) => rejectMutation.mutate({ id: selectedPass.id, remarks })}
            onClose={() => setSelectedPass(null)}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}