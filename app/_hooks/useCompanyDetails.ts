"use client";

import { useState, useEffect } from "react";

export function useCompanyDetails() {
  const [companyDetails, setCompanyDetails] = useState([]);

  useEffect(() => {
    async function getCompanyDetails() {
      try {
        const res = await fetch("/api/account-details", {
          method: "GET",
        });
        const { success, data, error } = await res.json();
        if (!success) {
          console.error("Failed to fetch details:", error);
          return;
        }

        if (data) {
          setCompanyDetails(data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
    getCompanyDetails();
  }, []);

  return { companyDetails };
}
