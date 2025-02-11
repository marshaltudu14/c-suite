"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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

// Frontend Zod schema for real-time validation
const formSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  userRole: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  industryType: z.string().optional(),
  industryStage: z.string().optional(),
  industrySize: z
    .string()
    .regex(/^\d*$/, "Industry size must be an integer")
    .optional()
    .transform((val) => (val === "" ? null : val)),
  companyDetails: z.string().optional(),
  companyMission: z.string().optional(),
  companyVision: z.string().optional(),
  companyPolicy: z.string().optional(),
  extraDetails: z.string().optional(),
});

export default function MyAccountDialog({ open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Real-time validation errors
  const [errors, setErrors] = useState({});

  // Refs for scrolling to first error
  const userNameRef = useRef(null);
  const companyNameRef = useRef(null);
  const industrySizeRef = useRef(null);

  // Validate as user types using Zod
  useEffect(() => {
    const formValues = {
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
    };

    const result = formSchema.safeParse(formValues);
    if (!result.success) {
      const newErrors = {};
      for (const issue of result.error.issues) {
        newErrors[issue.path[0]] = issue.message;
      }
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [
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
  ]);

  // Fetch existing account details when dialog is opened
  useEffect(() => {
    async function fetchAccountDetails() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/account-details", {
          method: "GET",
        });
        const { success, data, error } = await res.json();
        if (!success) {
          console.error("Failed to fetch details:", error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setUserName(data.user_name || "");
          setUserRole(data.user_role || "");
          setCompanyName(data.company_name || "");
          setIndustryType(data.industry_type || "");
          setIndustryStage(data.industry_stage || "");
          setIndustrySize(data.industry_size?.toString() || "");
          setCompanyDetails(data.company_details || "");
          setCompanyMission(data.company_mission || "");
          setCompanyVision(data.company_vision || "");
          setCompanyPolicy(data.company_policy || "");
          setExtraDetails(data.extra_details || "");
        } else {
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
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchAccountDetails();
    }
  }, [open]);

  // Scroll to the first error field
  function scrollToFirstErrorField(errorField) {
    switch (errorField) {
      case "userName":
        userNameRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "companyName":
        companyNameRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "industrySize":
        industrySizeRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  }

  // Submit handler
  async function handleSubmit() {
    // Check for validation errors
    const currentErrors = Object.keys(errors);
    if (currentErrors.length > 0) {
      scrollToFirstErrorField(currentErrors[0]);
      return;
    }

    setIsSubmitting(true);
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
        setIsSubmitting(false);
        return;
      }

      alert("Your account details were saved successfully!");
      // Do NOT close the dialog; remove or comment out this line:
      // onOpenChange(false);
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
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

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading details...</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-6 mt-4 w-full">
                {/* Personal Information */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 w-full">
                  <h3 className="text-base font-medium mb-4 text-gray-700 dark:text-gray-200">
                    Personal Information
                  </h3>
                  <div className="flex flex-col space-y-4">
                    <div ref={userNameRef}>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="userName"
                        placeholder="Enter your full name"
                        className="w-full"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                      {errors.userName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.userName}
                        </p>
                      )}
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
                    <div ref={companyNameRef}>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="companyName"
                        placeholder="Enter your company name"
                        className="w-full"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                      {errors.companyName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company & Industry */}
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
                          <SelectItem value="it-services">
                            IT Services
                          </SelectItem>
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
                    <div ref={industrySizeRef}>
                      <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">
                        No. of Employees
                      </label>
                      <Input
                        id="industrySize"
                        placeholder="e.g. 50 employees"
                        className="w-full"
                        value={industrySize}
                        onChange={(e) => setIndustrySize(e.target.value)}
                      />
                      {errors.industrySize && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.industrySize}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
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

                <div>
                  <Button
                    variant="default"
                    className="w-full flex items-center justify-center"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
