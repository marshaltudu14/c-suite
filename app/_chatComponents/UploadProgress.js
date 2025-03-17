"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

export default function UploadProgress({ isUploading, uploadProgress }) {
  if (!isUploading) return null;

  return (
    <div className="px-4 pt-2">
      <Progress value={uploadProgress} className="h-1" />
    </div>
  );
}
