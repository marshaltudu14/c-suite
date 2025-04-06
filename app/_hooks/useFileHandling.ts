"use client";

import { useState } from "react";
import { toast } from "sonner";
import React from "react"; // Import React for event types

// Maximum file sizes in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

export function useFileHandling() {
  const [attachments, setAttachments] = useState<File[]>([]); // Use File[] type for state
  const [pastedContent, setPastedContent] = useState<string>(""); // Type state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => { // Type event parameter
    // Ensure e.target and e.target.files are not null
    if (!e.target || !e.target.files) {
      return;
    }
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    // Process and validate each file
    const validFiles = files.filter((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > MAX_IMAGE_SIZE) {
          // Correct toast call pattern
          toast("File too large", {
            description: `Image ${file.name} exceeds the 5MB limit`,
          });
          return false;
        }
        return true;
      } else if (file.type === "application/pdf") {
        if (file.size > MAX_PDF_SIZE) {
          // Correct toast call pattern
          toast("File too large", {
            description: `PDF ${file.name} exceeds the 50MB limit`,
          });
          return false;
        }
        return true;
      }
      // Correct toast call pattern
      toast("Unsupported file type", {
        description: `${file.name} is not a supported file type (image or PDF)`,
      });
      return false;
    });

    // Directly add valid files to state
    setAttachments((prev) => [...prev, ...validFiles]);

    // Simulate upload completion (remove FileReader logic)
    // Keep progress simulation for UI feedback
    // Use a more realistic simulation time or remove if instant feedback is okay
    const simulationTime = Math.min(validFiles.length * 500, 3000); // Example: 0.5s per file, max 3s
    setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
        }, 500); // Short delay after reaching 100%
    }, simulationTime);

  };

  // Assuming handlePaste is used on a textarea or input
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => { // Type event parameter
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData("text");

    if (pastedText.length > 5000) {
      e.preventDefault();
      setPastedContent(pastedText);
      // Correct toast call pattern (using info or warning might be appropriate)
      toast("Large content pasted", { // Use toast directly, not toast.info
        description: "Your pasted content is displayed above the input area",
        // variant: "info", // Sonner might not have an 'info' variant, adjust if needed
      });
    }
  };

  const removePastedContent = () => {
    setPastedContent("");
  };

  const removeAttachment = (index: number) => { // Type index parameter
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    attachments,
    setAttachments,
    pastedContent,
    setPastedContent,
    isUploading,
    uploadProgress,
    handleFileUpload,
    handlePaste,
    removePastedContent,
    removeAttachment,
  };
}
