"use client";

import React, { useState, useEffect, useRef } from "react"; // Import React
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Loader2,
  User,
  Building2,
  Briefcase,
  FileText,
  AlertCircle,
} from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner"; // Import toast

// Frontend Zod schema for real-time validation
const MAX_TEXTAREA_CHARS = 1000;
const MAX_INPUT_CHARS = 250;

const formSchema = z.object({
  userName: z
    .string()
    .min(1, "User name is required")
    .max(MAX_INPUT_CHARS, `Maximum ${MAX_INPUT_CHARS} characters allowed`),
  userRole: z
    .string()
    .max(MAX_INPUT_CHARS, `Maximum ${MAX_INPUT_CHARS} characters allowed`)
    .optional(),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(MAX_INPUT_CHARS, `Maximum ${MAX_INPUT_CHARS} characters allowed`),
  industryType: z.string().optional(),
  industryStage: z.string().optional(),
  industrySize: z
    .string()
    .regex(/^\d*$/, "Industry size must be an integer")
    .max(MAX_INPUT_CHARS, `Maximum ${MAX_INPUT_CHARS} characters allowed`)
    .optional()
    .transform((val) => (val === "" ? null : val)),
  companyDetails: z
    .string()
    .max(MAX_TEXTAREA_CHARS, `Maximum ${MAX_TEXTAREA_CHARS} characters allowed`)
    .optional(),
  companyMission: z
    .string()
    .max(MAX_TEXTAREA_CHARS, `Maximum ${MAX_TEXTAREA_CHARS} characters allowed`)
    .optional(),
  companyVision: z
    .string()
    .max(MAX_TEXTAREA_CHARS, `Maximum ${MAX_TEXTAREA_CHARS} characters allowed`)
    .optional(),
  companyPolicy: z
    .string()
    .max(MAX_TEXTAREA_CHARS, `Maximum ${MAX_TEXTAREA_CHARS} characters allowed`)
    .optional(),
  extraDetails: z
    .string()
    .max(MAX_TEXTAREA_CHARS, `Maximum ${MAX_TEXTAREA_CHARS} characters allowed`)
    .optional(),
});

// Define prop types for MyAccountDialog
interface MyAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define props for CharacterCounter outside the main component
interface CharacterCounterProps {
  current: number;
  max: number;
  fieldName: string;
  errors: { [key: string]: string | undefined }; // Add errors prop
}

// Define CharacterCounter outside the main component
const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max, fieldName, errors }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="mt-1 flex flex-col space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span
          className={`${
            isAtLimit
              ? "text-red-500 font-medium"
              : isNearLimit
              ? "text-amber-500"
              : "text-gray-500"
          }`}
        >
          {current}/{max} characters
        </span>
        {/* Use errors prop with bracket notation */}
        {errors[fieldName] && (
          <span className="text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors[fieldName]}
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className="h-1"
        // indicatorClassName prop removed
      />
    </div>
  );
};


export default function MyAccountDialog({ open, onOpenChange }: MyAccountDialogProps) { // Apply props type
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formCompletion, setFormCompletion] = useState(0);

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

  // Real-time validation errors - Add index signature
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  // Calculate character counts
  const characterCounts = {
    userName: userName.length,
    userRole: userRole.length,
    companyName: companyName.length,
    industrySize: industrySize.length,
    companyDetails: companyDetails.length,
    companyMission: companyMission.length,
    companyVision: companyVision.length,
    companyPolicy: companyPolicy.length,
    extraDetails: extraDetails.length,
  };

  // Calculate form completion percentage
  useEffect(() => {
    const requiredFields = { userName, companyName };
    const requiredFieldsCount = Object.keys(requiredFields).length;
    const filledRequiredFields = Object.values(requiredFields).filter(
      (value) => typeof value === 'string' && value.trim() !== "" // Ensure value is string before trim
    ).length;

    const percentComplete = Math.round(
      (filledRequiredFields / requiredFieldsCount) * 100
    );
    setFormCompletion(percentComplete);
  }, [userName, companyName]);

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
        // Ensure path[0] is a string or number before using it as an index
        const pathKey = issue.path[0];
        if (typeof pathKey === 'string' || typeof pathKey === 'number') {
          newErrors[pathKey] = issue.message;
        }
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

  // Submit handler
  async function handleSubmit() {
    // Check for validation errors
    const currentErrors = Object.keys(errors);
    if (currentErrors.length > 0) {
      // Find the tab containing the first error
      let tabWithError = "personal";
      const firstErrorKey = currentErrors[0];
      if (
        firstErrorKey === "industryType" ||
        firstErrorKey === "industryStage" ||
        firstErrorKey === "industrySize"
      ) {
        tabWithError = "company";
      } else if (
        [
          "companyDetails",
          "companyMission",
          "companyVision",
          "companyPolicy",
          "extraDetails",
        ].includes(firstErrorKey)
      ) {
        tabWithError = "details";
      }

      setActiveTab(tabWithError);
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
        // Correct toast call for error
        toast.error("Failed to save account details", {
          description: data.error || "An unknown error occurred.",
        });
        setIsSubmitting(false);
        return;
      }

      // Correct toast call for success
      toast.success("Success!", {
        description: "Your account details were saved successfully!",
      });
    } catch (error) {
       // Correct toast call for catch block error
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full"
        >
          {/* Header with progress bar */}
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold">
                Manage Account Info
              </DialogTitle>
              <DialogDescription className="text-gray-500 opacity-90">
                Set up your profile and company details
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Progress value={formCompletion} className="h-2 bg-blue-400/30" />
              <span className="text-sm font-medium">{formCompletion}%</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-3 text-lg">Loading your profile...</span>
            </div>
          ) : (
            <div className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger
                    value="personal"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Personal</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="company"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Company</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Details</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  <AnimatePresence mode="wait">
                    <TabsContent value="personal" className="mt-0" asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Your Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              id="userName"
                              placeholder="Enter your full name"
                              className="w-full bg-white dark:bg-gray-800"
                              value={userName}
                              onChange={(e) =>
                                setUserName(
                                  e.target.value.slice(0, MAX_INPUT_CHARS)
                                )
                              }
                              maxLength={MAX_INPUT_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.userName}
                              max={MAX_INPUT_CHARS}
                              fieldName="userName"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              User Role
                            </label>
                            <Input
                              placeholder="Enter your role (e.g., Marketing Director)"
                              className="w-full bg-white dark:bg-gray-800"
                              value={userRole}
                              onChange={(e) =>
                                setUserRole(
                                  e.target.value.slice(0, MAX_INPUT_CHARS)
                                )
                              }
                              maxLength={MAX_INPUT_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.userRole}
                              max={MAX_INPUT_CHARS}
                              fieldName="userRole"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Company Name{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Input
                              id="companyName"
                              placeholder="Enter your company name"
                              className="w-full bg-white dark:bg-gray-800"
                              value={companyName}
                              onChange={(e) =>
                                setCompanyName(
                                  e.target.value.slice(0, MAX_INPUT_CHARS)
                                )
                              }
                              maxLength={MAX_INPUT_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.companyName}
                              max={MAX_INPUT_CHARS}
                              fieldName="companyName"
                              errors={errors} // Pass errors state
                            />
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="company" className="mt-0" asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Industry Type
                            </label>
                            <Select
                              onValueChange={(value) => setIndustryType(value)}
                              value={industryType}
                            >
                              <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Choose industry type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="it-services">
                                  IT Services
                                </SelectItem>
                                <SelectItem value="industrial">
                                  Industrial
                                </SelectItem>
                                <SelectItem value="marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem value="healthcare">
                                  Healthcare
                                </SelectItem>
                                <SelectItem value="education">
                                  Education
                                </SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="manufacturing">
                                  Manufacturing
                                </SelectItem>
                                <SelectItem value="consulting">
                                  Consulting
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {/* Use errors state directly with bracket notation */}
                            {errors['industryType'] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors['industryType']}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Industry Stage
                            </label>
                            <Select
                              onValueChange={(value) => setIndustryStage(value)}
                              value={industryStage}
                            >
                              <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Choose industry stage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="start-up">
                                  Start-up
                                </SelectItem>
                                <SelectItem value="early-growth">
                                  Early Growth
                                </SelectItem>
                                <SelectItem value="mid-size">
                                  Mid-Size
                                </SelectItem>
                                <SelectItem value="established">
                                  Established
                                </SelectItem>
                                <SelectItem value="enterprise">
                                  Enterprise
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {/* Use errors state directly with bracket notation */}
                            {errors['industryStage'] && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors['industryStage']}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Number of Employees
                            </label>
                            <Input
                              id="industrySize"
                              placeholder="e.g. 50"
                              className="w-full bg-white dark:bg-gray-800"
                              value={industrySize}
                              onChange={(e) =>
                                setIndustrySize(
                                  e.target.value.slice(0, MAX_INPUT_CHARS)
                                )
                              }
                              maxLength={MAX_INPUT_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.industrySize}
                              max={MAX_INPUT_CHARS}
                              fieldName="industrySize"
                              errors={errors} // Pass errors state
                            />
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-0" asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-5">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              About Your Company
                            </label>
                            <Textarea
                              placeholder="Briefly describe your company"
                              className="w-full min-h-24 bg-white dark:bg-gray-800"
                              value={companyDetails}
                              onChange={(e) =>
                                setCompanyDetails(
                                  e.target.value.slice(0, MAX_TEXTAREA_CHARS)
                                )
                              }
                              maxLength={MAX_TEXTAREA_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.companyDetails}
                              max={MAX_TEXTAREA_CHARS}
                              fieldName="companyDetails"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Company Mission
                            </label>
                            <Textarea
                              placeholder="Describe your company's mission"
                              className="w-full min-h-24 bg-white dark:bg-gray-800"
                              value={companyMission}
                              onChange={(e) =>
                                setCompanyMission(
                                  e.target.value.slice(0, MAX_TEXTAREA_CHARS)
                                )
                              }
                              maxLength={MAX_TEXTAREA_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.companyMission}
                              max={MAX_TEXTAREA_CHARS}
                              fieldName="companyMission"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Company Vision
                            </label>
                            <Textarea
                              placeholder="Share the vision statement"
                              className="w-full min-h-24 bg-white dark:bg-gray-800"
                              value={companyVision}
                              onChange={(e) =>
                                setCompanyVision(
                                  e.target.value.slice(0, MAX_TEXTAREA_CHARS)
                                )
                              }
                              maxLength={MAX_TEXTAREA_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.companyVision}
                              max={MAX_TEXTAREA_CHARS}
                              fieldName="companyVision"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Company Policy
                            </label>
                            <Textarea
                              placeholder="Outline any essential policies"
                              className="w-full min-h-24 bg-white dark:bg-gray-800"
                              value={companyPolicy}
                              onChange={(e) =>
                                setCompanyPolicy(
                                  e.target.value.slice(0, MAX_TEXTAREA_CHARS)
                                )
                              }
                              maxLength={MAX_TEXTAREA_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.companyPolicy}
                              max={MAX_TEXTAREA_CHARS}
                              fieldName="companyPolicy"
                              errors={errors} // Pass errors state
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                              Extra Details
                            </label>
                            <Textarea
                              placeholder="Add any additional info here"
                              className="w-full min-h-24 bg-white dark:bg-gray-800"
                              value={extraDetails}
                              onChange={(e) =>
                                setExtraDetails(
                                  e.target.value.slice(0, MAX_TEXTAREA_CHARS)
                                )
                              }
                              maxLength={MAX_TEXTAREA_CHARS}
                            />
                            <CharacterCounter
                              current={characterCounts.extraDetails}
                              max={MAX_TEXTAREA_CHARS}
                              fieldName="extraDetails"
                              errors={errors} // Pass errors state
                            />
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </div>
              </Tabs>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-3">
                  {activeTab !== "personal" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setActiveTab((prev) => {
                          if (prev === "details") return "company";
                          if (prev === "company") return "personal";
                          return prev;
                        })
                      }
                    >
                      Previous
                    </Button>
                  )}

                  {activeTab !== "details" ? (
                    <Button
                      variant="default"
                      onClick={() =>
                        setActiveTab((prev) => {
                          if (prev === "personal") return "company";
                          if (prev === "company") return "details";
                          return prev;
                        })
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleSubmit}
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className="flex items-center gap-2 min-w-32"
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
