"use client";

import React from "react";
import { FileText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define props interface
interface PastedContentProps {
  pastedContent: string | null | undefined;
  removePastedContent: () => void;
}

export default function PastedContent({ pastedContent, removePastedContent }: PastedContentProps) {
  if (!pastedContent) return null;

  return (
    <Card className="mx-4 mt-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="py-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Pasted Content
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={removePastedContent}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 max-h-24 overflow-y-auto">
          {pastedContent.substring(0, 100)}...
        </div>
      </CardContent>
    </Card>
  );
}
