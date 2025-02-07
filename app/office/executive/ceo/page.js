import ChatInterface from "@/app/_components/ChatInterface";
import React from "react";

const CeoPage = () => {
  return (
    <div>
      <div>
        <ChatInterface isOnline={true} role="ceo" />
      </div>
    </div>
  );
};

export default CeoPage;
