import ChatInterface from "@/app/_components/ChatInterface";
import React from "react";

const CeoPage = () => {
  const CeoData = {
    name: "Satya",
    position: "CEO",
    image: "/CEO.webp",
    systemPrompt: `You are the CEO of OfStartup. Provide business related guidance, planning, and respond with a professional visionary approach.`,
  };
  return (
    <div>
      <div>
        <ChatInterface personaData={CeoData} />
      </div>
    </div>
  );
};

export default CeoPage;
