import { ThemeSwitcher } from "@/components/theme-switcher";
import React from "react";

const Header = () => {
  return (
    <div className="flex">
      <div>Header</div>
      <div>
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Header;
