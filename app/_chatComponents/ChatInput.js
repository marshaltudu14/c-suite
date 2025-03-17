"use client";

import React from "react";
import { Loader2, Send, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ChatInput({
  textareaRef,
  fileInputRef,
  input,
  handleInputChange,
  handleKeyDown,
  handlePaste,
  customSubmit,
  selectedPerson,
  isLoading,
  pastedContent,
  attachments,
}) {
  return (
    <div className="relative flex items-end rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700">
      <Textarea
        ref={textareaRef}
        name="prompt"
        rows={1}
        placeholder="Type a message..."
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="resize-none w-full min-h-12 max-h-36 py-3 pl-4 pr-20 focus:outline-none border-none focus:ring-0 bg-transparent"
        disabled={!selectedPerson || isLoading}
      />

      <div className="absolute right-2 bottom-2 flex items-center space-x-1">
        {/* File upload button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedPerson || isLoading}
              >
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Upload image (max 5MB) or PDF (max 50MB)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={(e) => fileInputRef.current.onChange(e)}
          disabled={!selectedPerson || isLoading}
        />

        {/* Send button */}
        <Button
          className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
          size="icon"
          type="submit"
          onClick={customSubmit}
          disabled={
            !selectedPerson ||
            isLoading ||
            (input.trim() === "" && !pastedContent && attachments.length === 0)
          }
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
