"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
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

// Define a Zod schema for your form fields
const accountSchema = z.object({
  userName: z.string().min(1, "Name is required."),
  userRole: z.string().optional(),
  companyName: z.string().min(1, "Company name is required."),
  industryType: z.string().optional(),
  industryStage: z.string().optional(),
  industrySize: z.string().optional(),
  companyDetails: z.string().optional(),
  companyMission: z.string().optional(),
  companyVision: z.string().optional(),
  companyPolicy: z.string().optional(),
  extraDetails: z.string().optional(),
});

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

  // Local state for errors (from Zod)
  const [formErrors, setFormErrors] = useState({});

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
          // If no data found, clear the fields
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

  // Validate using Zod and submit data
  async function handleSubmit() {
    setFormErrors({});

    // Attempt to parse data with Zod
    try {
      const parsedData = accountSchema.parse({
        userName,
        userRole,
        companyName,
        industryType,
        industryStage,
        industrySize,
        companyDetails,
        companyMission,
        companyVision,
        companyPolicy,
        extraDetails,
      });

      // If parse was successful, proceed with saving data
      const response = await fetch("/api/account-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: parsedData.userName,
          user_role: parsedData.userRole,
          company_name: parsedData.companyName,
          industry_type: parsedData.industryType,
          industry_stage: parsedData.industryStage,
          industry_size: parsedData.industrySize,
          company_details: parsedData.companyDetails,
          company_mission: parsedData.companyMission,
          company_vision: parsedData.companyVision,
          company_policy: parsedData.companyPolicy,
          extra_details: parsedData.extraDetails,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        alert(`Error: ${json.error || "Failed to save account details"}`);
        return;
      }

      alert("Your account details were saved successfully!");
      onOpenChange(false);
    } catch (err) {
      // If Zod validation fails, show error messages
      if (err.name === "ZodError") {
        const errors = {};
        err.issues.forEach((issue) => {
          // For example, "userName" is the path
          const fieldName = issue.path[0];
          errors[fieldName] = issue.message;
        });
        setFormErrors(errors);
      } else {
        // Some other error (network, etc.)
        alert("An unexpected error occurred. Please try again.");
      }
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
                {/* Your Name */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter your full name"
                    className={`w-full ${
                      formErrors.userName ? "border border-red-500" : ""
                    }`}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                  {formErrors.userName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.userName}
                    </p>
                  )}
                </div>

                {/* User Role */}
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

                {/* Company Name */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter your company name"
                    className={`w-full ${
                      formErrors.companyName ? "border border-red-500" : ""
                    }`}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  {formErrors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.companyName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Company & Industry */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
              <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                Company &amp; Industry
              </h3>
              <div className="flex flex-col space-y-4">
                {/* Industry Type */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Industry Type
                  </label>
                  <Select
                    onValueChange={(val) => setIndustryType(val)}
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

                {/* Industry Stage */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                    Industry Stage
                  </label>
                  <Select
                    onValueChange={(val) => setIndustryStage(val)}
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

                {/* Industry Size */}
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
                {/* Company Details */}
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

                {/* Company Mission */}
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

                {/* Company Vision */}
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

                {/* Company Policy */}
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

                {/* Extra Details */}
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
