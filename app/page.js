import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Executives Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Executives
          </h2>
          <div className="space-y-4">
            {/* CEO */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                CEO
              </div>
            </div>
            {/* CFO */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                CFO
              </div>
            </div>
            {/* CMO */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                CMO
              </div>
            </div>
            {/* COO */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                COO
              </div>
            </div>
            {/* CTO */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                CTO
              </div>
            </div>
          </div>
        </div>

        {/* Employees Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Employees
          </h2>
          <div className="space-y-4">
            {/* Business Development Associate */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Business Development Associate
              </div>
            </div>
            {/* Content Writer */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Content Writer
              </div>
            </div>
            {/* Customer-Support */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Customer-Support
              </div>
            </div>
            {/* Data-Analyst */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Data-Analyst
              </div>
            </div>
            {/* Hr-executive */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Hr-executive
              </div>
            </div>
            {/* Legal Advisor */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Legal Advisor
              </div>
            </div>
            {/* Marketing Executive */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Marketing Executive
              </div>
            </div>
            {/* Sales Executive */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Sales Executive
              </div>
            </div>
            {/* Software Engineer */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Software Engineer
              </div>
            </div>
            {/* UI/UX Designer */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                UI/UX Designer
              </div>
            </div>
            {/* Social Media Manager */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Social Media Manager
              </div>
            </div>
            {/* Supply Chain */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                Supply Chain
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
