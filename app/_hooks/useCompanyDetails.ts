"use client";

import { useState, useEffect } from "react";

export function useCompanyDetails() {
  const [companyDetails, setCompanyDetails] = useState([
    {
      company_name: "Nayem Inc.",
      company_slogan: "The slogan of the company.",
      company_values: "The values of the company.",
      company_mission: "The mission of the company.",
      company_vision: "The vision of the company.",
    },
  ]);

  return { companyDetails };
}