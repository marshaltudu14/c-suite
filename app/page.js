import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  return (
    <div>
      <div>
        executives
        <div>
          <div>CEO</div>
          <div>CFO</div>
          <div>CMO</div>
          <div>COO</div>
          <div>CTO</div>
        </div>
      </div>
      <div>
        Departments
        <div>
          <div>Hr</div>
          <div>Legal</div>
          <div>Marketing</div>
          <div>Sales</div>
        </div>
      </div>
      <div>employees</div>
    </div>
  );
}
