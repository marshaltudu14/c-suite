"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

// Define props interface
interface UploadProgressProps {
  isUploading: boolean;
  uploadProgress: number;
}

export default function UploadProgress({ isUploading, uploadProgress }: UploadProgressProps) {
  if (!isUploading) return null;

  return (
    <div className="px-4 pt-2">
      <Progress value={uploadProgress} className="h-1" />
    </div>
  );
}
