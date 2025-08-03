"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  useReasoningModel: boolean;
  toggleModel: (checked: boolean) => void;
}

export default function ModelSelector({ useReasoningModel, toggleModel }: ModelSelectorProps) { // Apply props type
  return (
    <div className="flex items-center justify-end mb-2">
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {useReasoningModel ? "Reasoning Mode" : "Standard Mode"}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={useReasoningModel}
                  onCheckedChange={toggleModel}
                />
                <Lightbulb
                  className={`h-4 w-4 ${
                    useReasoningModel ? "text-yellow-500" : "text-gray-400"
                  }`}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Toggle between standard and reasoning models
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
