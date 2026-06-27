import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ApplyPass() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    reason: "",
    destination: "",
    dateOfLeaving: "",
    timeOfLeaving: "",
    expectedReturn: "",
    attachmentUrl: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const createPassMutation = useMutation({
    mutationFn: (passData) => base44.entities.GatePass.create(passData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGatePasses"] });
      queryClient.invalidateQueries({ queryKey: ["allGatePasses"] });
      navigate(createPageUrl("Dashboard"));
    },
    onError: (error) => {
      setError("Failed to submit gate pass request. Please try again.");
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, attachmentUrl: file_url });
    } catch (error) {
      setError("Failed to upload file. Please try again.");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("User information not loaded. Please refresh the page.");
      return;
    }

    const passData = {
      ...formData,
      studentId: user.id,
      studentName: user.full_name,
      rollNo: user.rollNo || "N/A",
      branch: user.branch || "N/A",
      year: user.year || "N/A",
      contact: user.contact || "N/A",
      status: "pending",
    };

    createPassMutation.mutate(passData);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Gate Pass</h1>
          <p className="text-gray-600 mt-1">Fill in the details to request permission to leave campus</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Gate Pass Application Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Info Display */}
              {user && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-blue-900 mb-2">Student Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{user.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Roll No:</span>
                      <span className="ml-2 font-medium">{user.rollNo || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Branch:</span>
                      <span className="ml-2 font-medium">{user.branch || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Year:</span>
                      <span className="ml-2 font-medium">{user.year || "Not set"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leaving *</Label>
                <Textarea
                  id="reason"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide detailed reason (medical, family emergency, personal work, etc.)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Where are you going?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfLeaving">Date of Leaving *</Label>
                  <Input
                    id="dateOfLeaving"
                    type="date"
                    required
                    value={formData.dateOfLeaving}
                    onChange={(e) => setFormData({ ...formData, dateOfLeaving: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeOfLeaving">Time of Leaving *</Label>
                  <Input
                    id="timeOfLeaving"
                    type="time"
                    required
                    value={formData.timeOfLeaving}
                    onChange={(e) => setFormData({ ...formData, timeOfLeaving: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Expected Return Date & Time *</Label>
                <Input
                  id="expectedReturn"
                  type="datetime-local"
                  required
                  value={formData.expectedReturn}
                  onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Supporting Document (Optional)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                </div>
                {formData.attachmentUrl && (
                  <p className="text-sm text-green-600">✓ File uploaded successfully</p>
                )}
                <p className="text-xs text-gray-500">
                  Upload medical certificate, letter, or any supporting document (PDF, JPG, PNG)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPassMutation.isPending || uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {createPassMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}