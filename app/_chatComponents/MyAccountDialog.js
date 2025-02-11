"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function MyAccountDialog({ open, onOpenChange }) {
  // Local state for form fields
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [industryStage, setIndustryStage] = useState("");
  const [industrySize, setIndustrySize] = useState("");
  const [companyDetails, setCompanyDetails] = useState("");
  const [companyMission, setCompanyMission] = useState("");
  const [companyVision, setCompanyVision] = useState("");
  const [companyPolicy, setCompanyPolicy] = useState("");
  const [extraDetails, setExtraDetails] = useState("");

  // Fetch existing account details whenever the dialog is opened
  useEffect(() => {
    async function fetchAccountDetails() {
      try {
        const res = await fetch("/api/account-details", {
          method: "GET",
        });
        const { success, data, error } = await res.json();
        if (!success) {
          console.error("Failed to fetch details:", error);
          return;
        }

        // If data exists, populate state
        if (data) {
          setUserName(data.user_name || "");
          setUserRole(data.user_role || "");
          setCompanyName(data.company_name || "");
          setIndustryType(data.industry_type || "");
          setIndustryStage(data.industry_stage || "");
          setIndustrySize(data.industry_size || "");
          setCompanyDetails(data.company_details || "");
          setCompanyMission(data.company_mission || "");
          setCompanyVision(data.company_vision || "");
          setCompanyPolicy(data.company_policy || "");
          setExtraDetails(data.extra_details || "");
        } else {
          // If no data found, clear the fields (or leave them as they are)
          setUserName("");
          setUserRole("");
          setCompanyName("");
          setIndustryType("");
          setIndustryStage("");
          setIndustrySize("");
          setCompanyDetails("");
          setCompanyMission("");
          setCompanyVision("");
          setCompanyPolicy("");
          setExtraDetails("");
        }
      } catch (err) {
        console.error("Error fetching account details:", err);
      }
    }

    if (open) {
      fetchAccountDetails();
    }
  }, [open]);

  // Submit handler
  async function handleSubmit() {
    try {
      const response = await fetch("/api/account-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          user_role: userRole,
          company_name: companyName,
          industry_type: industryType,
          industry_stage: industryStage,
          industry_size: industrySize,
          company_details: companyDetails,
          company_mission: companyMission,
          company_vision: companyVision,
          company_policy: companyPolicy,
          extra_details: extraDetails,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(`Error: ${data.error || "Failed to save account details"}`);
        return;
      }

      alert("Your account details were saved successfully!");
      onOpenChange(false);
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md w-full mx-auto bg-white dark:bg-gray-900
                   rounded-md shadow-lg p-4 sm:p-6
                   max-h-[80vh] overflow-y-auto
                   scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
                   dark:scrollbar-thumb-gray-600"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Manage Account Info
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Update your personal and company information
            </DialogDescription>
          </DialogHeader>

          {/* Segmented form layout */}
          <div className="flex flex-col space-y-6 mt-4 w-full">
            {/* Section 1: Personal Information */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
              <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                Personal Information
              </h3>
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter your full name"
                    className="w-full"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    User Role
                  </label>
                  <Input
                    placeholder="Enter your role"
                    className="w-full"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter your company name"
                    className="w-full"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Company & Industry */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
              <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                Company &amp; Industry
              </h3>
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Industry Type
                  </label>
                  <Select
                    onValueChange={(value) => setIndustryType(value)}
                    value={industryType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it-services">IT Services</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Industry Stage
                  </label>
                  <Select
                    onValueChange={(value) => setIndustryStage(value)}
                    value={industryStage}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose industry stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start-up">Start-up</SelectItem>
                      <SelectItem value="mid-size">Mid-Size</SelectItem>
                      <SelectItem value="big-size">Big-Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Industry Size
                  </label>
                  <Input
                    placeholder="e.g. 50 employees"
                    className="w-full"
                    value={industrySize}
                    onChange={(e) => setIndustrySize(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Details */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
              <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                Additional Details
              </h3>
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    About Your Company
                  </label>
                  <Textarea
                    placeholder="Briefly describe your company"
                    className="w-full"
                    value={companyDetails}
                    onChange={(e) => setCompanyDetails(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Company Mission
                  </label>
                  <Textarea
                    placeholder="Describe your company's mission"
                    className="w-full"
                    value={companyMission}
                    onChange={(e) => setCompanyMission(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Company Vision
                  </label>
                  <Textarea
                    placeholder="Share the vision statement"
                    className="w-full"
                    value={companyVision}
                    onChange={(e) => setCompanyVision(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Company Policy
                  </label>
                  <Textarea
                    placeholder="Outline any essential policies"
                    className="w-full"
                    value={companyPolicy}
                    onChange={(e) => setCompanyPolicy(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Extra Details
                  </label>
                  <Textarea
                    placeholder="Add any additional info here"
                    className="w-full"
                    value={extraDetails}
                    onChange={(e) => setExtraDetails(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                variant="default"
                className="w-full"
                onClick={handleSubmit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
