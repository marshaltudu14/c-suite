"use client";

import { useState } from "react";
import { toast } from "sonner";

// Maximum file sizes in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

export function useFileHandling() {
  const [attachments, setAttachments] = useState([]);
  const [pastedContent, setPastedContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e) => {
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
          toast({
            title: "File too large",
            description: `Image ${file.name} exceeds the 5MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      } else if (file.type === "application/pdf") {
        if (file.size > MAX_PDF_SIZE) {
          toast({
            title: "File too large",
            description: `PDF ${file.name} exceeds the 50MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      }
      toast({
        title: "Unsupported file type",
        description: `${file.name} is not a supported file type (image or PDF)`,
        variant: "destructive",
      });
      return false;
    });

    // Process valid files
    const filePromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result,
          };
          resolve(fileData);
        };

        reader.onerror = () => {
          toast({
            title: "Error reading file",
            description: `Could not read ${file.name}`,
            variant: "destructive",
          });
          resolve(null);
        };

        if (file.type.startsWith("image/")) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      });
    });

    Promise.all(filePromises).then((results) => {
      const validResults = results.filter(Boolean);
      setAttachments((prev) => [...prev, ...validResults]);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    });
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData("text");

    if (pastedText.length > 5000) {
      e.preventDefault();
      setPastedContent(pastedText);
      toast({
        title: "Large content pasted",
        description: "Your pasted content is displayed above the input area",
      });
    }
  };

  const removePastedContent = () => {
    setPastedContent("");
  };

  const removeAttachment = (index) => {
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
