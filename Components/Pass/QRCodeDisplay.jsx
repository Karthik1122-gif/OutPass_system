import React, { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, User, Calendar, MapPin, Clock, Copy, CheckCircle } from "lucide-react";

export default function QRCodeDisplay({ pass, onClose }) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && pass?.qrCode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Create a simple visual code representation
      const code = pass.qrCode;
      const gridSize = 10;
      const cellSize = size / gridSize;

      // Use hash of code to generate pattern
      let hash = 0;
      for (let i = 0; i < code.length; i++) {
        hash = ((hash << 5) - hash) + code.charCodeAt(i);
        hash = hash & hash;
      }

      // Draw pattern based on hash
      ctx.fillStyle = '#000000';
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const index = row * gridSize + col;
          if ((hash >> index) & 1) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }

      // Add border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, size, size);
    }
  }, [pass?.qrCode]);

  const handleCopy = () => {
    if (pass?.qrCode) {
      navigator.clipboard.writeText(pass.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = `gatepass-${pass.rollNo}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!pass) return null;

  return (
    <Dialog open={!!pass} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Gate Pass - Verification Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Visual Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>

          {/* Code Text */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-semibold text-gray-900 break-all">
                {pass.qrCode}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Pass Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">{pass.studentName}</span>
              <span className="text-gray-600">({pass.rollNo})</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{pass.destination}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Leaving: {pass.dateOfLeaving && format(new Date(pass.dateOfLeaving), "MMM dd, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Time: {pass.timeOfLeaving}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Show this code at the gate for verification
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}