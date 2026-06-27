import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ApprovalModal({ pass, onApprove, onReject, onClose, isLoading }) {
  const [remarks, setRemarks] = useState("");
  const isApproval = pass?.action === "approve";

  const handleSubmit = () => {
    if (isApproval) {
      onApprove(remarks);
    } else {
      if (!remarks.trim()) {
        alert("Please provide a reason for rejection");
        return;
      }
      onReject(remarks);
    }
  };

  return (
    <Dialog open={!!pass} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approve Gate Pass
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Gate Pass
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <p>
              <strong>Student:</strong> {pass?.studentName}
            </p>
            <p>
              <strong>Roll No:</strong> {pass?.rollNo}
            </p>
            <p>
              <strong>Reason:</strong> {pass?.reason}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">
              {isApproval ? "Remarks (Optional)" : "Reason for Rejection *"}
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isApproval
                  ? "Add any notes or instructions..."
                  : "Please provide a clear reason for rejection"
              }
              rows={4}
              required={!isApproval}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={
              isApproval
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isApproval ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}