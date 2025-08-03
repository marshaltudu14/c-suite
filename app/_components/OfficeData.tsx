// Add index signature type
export const demoExecutiveMessages: { [key: string]: string } = {
  ceo: "I've analyzed the market trends and prepared a strategic growth plan for next quarter. Let me know your thoughts on the updated proposal!",
  cfo: "The latest financial forecasts indicate a solid revenue increase, but we must allocate more resources to R&D. Thoughts?",
  cmo: "The recent ad campaign is performing above expectations, but we need to engage more on social channels to further boost conversion.",
  coo: "Logistics and operations look smooth, but I'd love your input on automating a few workflow processes next month.",
  cto: "We're testing the new platform update tonight to improve performance significantly. Any final checks before deployment?",
};

// Add index signature type
export const demoEmployeeMessages: { [key: string]: string } = {
  bda: "A potential B2B lead reached out with interest. I've drafted a proposal and would like your review.",
  cw: "The editorial calendar is ready, and I have a fresh batch of blog topics that'll grab audience attention!",
  cs: "A user encountered a billing issue, but we've resolved it. Let me know if there's anything else you'd like me to improve!",
  da: "I've cleaned the sales dataset and visualized the new insights. A summary is waiting in the dashboard!",
  hre: "I've scheduled two candidate interviews and drafted an internal survey about remote working preferences.",
  la: "There's a new regulation that affects our standard client contract. I've prepared an updated draft for your review.",
  me: "Our new campaign is performing well, but we can boost ROI by tweaking audience targeting slightly.",
  se: "I've updated the pipeline; there's a hot lead we should reach out to by tomorrow to secure a potential deal.",
  swe: "The new feature is almost complete, but I found a bug in the checkout flow. Investigating now!",
  uxd: "I've revised the latest wireframes with a new color palette and streamlined navigation. Ready for feedback!",
  smm: "Engagement is high on Instagram, but we could try short-form videos on TikTok to reach a younger audience.",
  sc: "Our inventory is running low, and the next shipment arrives next week. Just a heads-up on scheduling.",
};

export const executivesData = [
  {
    id: "chief-executive-officer",
    name: "Marshal",
    position: "CEO",
    image: "/CEO.webp",
    link: "/office/executive/chief-executive-officer",
    promptTemplate: `You are **{name}**—the **Chief Executive Officer (CEO)**... [Full CEO prompt template here]`, // Placeholder for brevity
  },
  {
    id: "chief-marketing-officer",
    name: "Zunaid",
    position: "CMO",
    image: "/CMO.webp",
    link: "/office/executive/chief-marketing-officer",
    promptTemplate: `You are **{name}**—the **Chief Marketing Officer (CMO)**... [Prompt template to be added]`,
  },
  {
    id: "chief-financial-officer",
    name: "Deepak",
    position: "CFO",
    image: "/CFO.webp",
    link: "/office/executive/chief-financial-officer",
    promptTemplate: `You are **{name}**—the **Chief Financial Officer (CFO)**... [Prompt template to be added]`,
  },
  {
    id: "chief-operating-officer",
    name: "Sukanth", // Assuming name was meant to be Sukanth based on previous CEO prompt reference
    position: "COO",
    image: "/COO.webp",
    link: "/office/executive/chief-operating-officer",
    promptTemplate: `You are **{name}**—the **Chief Operating Officer (COO)**... [Prompt template to be added]`,
  },
  {
    id: "chief-technology-officer",
    name: "Khushi",
    position: "CTO",
    image: "/CTO.webp",
    link: "/office/executive/chief-technology-officer",
    promptTemplate: `You are **{name}**—the **Chief Technology Officer (CTO)**... [Prompt template to be added]`,
  },
];

export const employeesData = [
  {
    id: "business-development-associate",
    name: "Alice Green",
    position: "Business Development Associate",
    image: "/CEO.webp",
    link: "/office/employee/business-development-associate",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "content-writer",
    name: "Bob Martin",
    position: "Content Writer",
    image: "/CEO.webp",
    link: "/office/employee/content-writer",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "customer-support",
    name: "Chris Kim",
    position: "Customer-Support", // Note: Position might need hyphenation consistency later
    image: "/CEO.webp",
    link: "/office/employee/customer-support",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "data-analyst",
    name: "Diana Lee",
    position: "Data-Analyst", // Note: Position might need hyphenation consistency later
    image: "/CEO.webp",
    link: "/office/employee/data-analyst",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "hr-executive",
    name: "Eva Wilson",
    position: "Hr-executive", // Note: Position might need hyphenation consistency later
    image: "/CEO.webp",
    link: "/office/employee/hr-executive",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "legal-advisor",
    name: "Gary Scott",
    position: "Legal Advisor",
    image: "/CEO.webp",
    link: "/office/employee/legal-advisor",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "marketing-executive",
    name: "Helen Clark",
    position: "Marketing Executive",
    image: "/CEO.webp",
    link: "/office/employee/marketing-executive",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "sales-executive",
    name: "Ian Turner",
    position: "Sales Executive",
    image: "/CEO.webp",
    link: "/office/employee/sales-executive",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "software-engineer",
    name: "Jack Li",
    position: "Software Engineer",
    image: "/CEO.webp",
    link: "/office/employee/software-engineer",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "ui-ux-designer",
    name: "Karen Walker",
    position: "UI/UX Designer",
    image: "/CEO.webp",
    link: "/office/employee/ui-ux-designer",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "social-media-manager",
    name: "Luke Anderson",
    position: "Social Media Manager",
    image: "/CEO.webp",
    link: "/office/employee/social-media-manager",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
  {
    id: "supply-chain",
    name: "Mia Perez",
    position: "Supply Chain",
    image: "/CEO.webp",
    link: "/office/employee/supply-chain",
    promptTemplate: `You are **{name}**—the **{position}**. [Prompt template to be added]`,
  },
];
