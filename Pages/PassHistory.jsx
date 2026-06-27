import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileText, Calendar, Clock, MapPin, FileDown, ExternalLink } from "lucide-react";
import QRCodeDisplay from "../components/pass/QRCodeDisplay";

export default function PassHistory() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: passes = [], isLoading } = useQuery({
    queryKey: ["myGatePasses", user?.email],
    queryFn: () =>
      user ? base44.entities.GatePass.filter({ created_by: user.email }, "-created_date") : [],
    enabled: !!user,
  });

  const filteredPasses = passes.filter((pass) => {
    if (filter === "all") return true;
    return pass.status === filter;
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
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pass History</h1>
          <p className="text-gray-600 mt-1">View all your gate pass requests and their status</p>
        </div>

        <div className="flex justify-between items-center">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{filteredPasses.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading passes...</p>
          </div>
        ) : filteredPasses.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No gate passes found</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPasses.map((pass) => (
              <Card
                key={pass.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPass(pass)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(pass.status)} border`}>
                          {pass.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Applied on {format(new Date(pass.created_date), "MMM dd, yyyy")}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900">{pass.reason}</h3>

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
                            HOD Remarks:
                          </p>
                          <p className="text-sm text-gray-600">{pass.hodRemarks}</p>
                        </div>
                      )}

                      {pass.attachmentUrl && (
                        <a
                          href={pass.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Attachment
                        </a>
                      )}
                    </div>

                    {pass.status === "approved" && (
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPass(pass);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          View QR Code
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedPass && selectedPass.status === "approved" && (
          <QRCodeDisplay pass={selectedPass} onClose={() => setSelectedPass(null)} />
        )}
      </div>
    </div>
  );
}