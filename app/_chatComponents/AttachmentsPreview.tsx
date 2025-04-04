"use client";

import React from "react";
import { FileText, Image as ImageIcon, X } from "lucide-react"; // Renamed Image import
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define prop types
interface AttachmentsPreviewProps {
  attachments: File[];
  removeAttachment: (index: number) => void;
}

export default function AttachmentsPreview({ attachments, removeAttachment }: AttachmentsPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="px-4 pt-2 flex flex-wrap gap-2">
      {attachments.map((file: File, index: number) => ( // Added types for file and index
        <div key={index}> {/* Wrap Card with a div and move key here */}
          <Card
            className="w-fit bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
          <CardContent className="p-2 flex items-center gap-2">
            {file.type.startsWith("image/") ? (
              <ImageIcon className="h-4 w-4 text-purple-500" /> // Use ImageIcon from lucide-react, removed alt
            ) : (
              <FileText className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-xs truncate max-w-32">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full ml-1"
              onClick={() => removeAttachment(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
