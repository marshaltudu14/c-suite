"use client";

import React from "react";
import { FileText, Image, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AttachmentsPreview({ attachments, removeAttachment }) {
  if (attachments.length === 0) return null;

  return (
    <div className="px-4 pt-2 flex flex-wrap gap-2">
      {attachments.map((file, index) => (
        <Card
          key={index}
          className="w-fit bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <CardContent className="p-2 flex items-center gap-2">
            {file.type.startsWith("image/") ? (
              <Image className="h-4 w-4 text-purple-500" />
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
      ))}
    </div>
  );
}
