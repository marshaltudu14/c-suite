"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Zap, Building, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Header from "../_components/Header";

const PricingPage = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = [
    {
      name: "Free",
      description: "For individuals exploring virtual AI executives",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "2 AI executives (CEO & CTO)",
        "Up to 100 messages per month",
        "Basic company profile",
        "Standard response time",
        "7-day chat history",
      ],
      limitations: [
        "No board meetings",
        "No additional team members",
        "No custom knowledge base",
      ],
      cta: "Start Free",
      icon: <Users size={24} className="text-blue-500" />,
      popular: false,
    },
    {
      name: "Basic",
      description: "For startups and small businesses",
      monthlyPrice: 25,
      annualPrice: 20,
      features: [
        "5 AI executives",
        "Up to 5,000 messages per month",
        "Detailed company profile",
        "Priority response time",
        "30-day chat history",
        "Basic board meetings (monthly)",
        "Up to 3 team members",
      ],
      limitations: ["Limited custom knowledge base"],
      cta: "Get Started",
      icon: <Briefcase size={24} className="text-indigo-500" />,
      popular: true,
    },
    {
      name: "Advanced",
      description: "For growing companies with complex needs",
      monthlyPrice: 129,
      annualPrice: 99,
      features: [
        "Full suite of AI executives",
        "Unlimited messages per month",
        "Advanced company profile",
        "Fast response time",
        "90-day chat history",
        "Weekly board meetings",
        "Up to 10 team members",
        "Custom knowledge base",
        "Export meeting insights",
      ],
      limitations: [],
      cta: "Choose Advanced",
      icon: <Zap size={24} className="text-violet-500" />,
      popular: false,
    },
    {
      name: "Enterprise",
      description: "For large organizations requiring custom solutions",
      monthlyPrice: null,
      annualPrice: null,
      features: [
        "Unlimited AI executives",
        "Unlimited messages",
        "Enterprise-grade company profile",
        "Fastest response time",
        "Unlimited chat history",
        "Unlimited board meetings",
        "Unlimited team members",
        "Advanced custom knowledge integration",
        "Priority support",
        "Dedicated account manager",
        "SSO & advanced security",
        "Custom AI training",
      ],
      limitations: [],
      cta: "Contact Sales",
      icon: <Building size={24} className="text-emerald-500" />,
      popular: false,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (!mounted) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/90">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="px-3 py-1 mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Choose Your <span className="text-primary">AI Executive</span>{" "}
              Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Build your virtual C-suite with AI executives tailored to your
              company's needs and goals.
            </p>

            <div className="flex items-center justify-center mt-10 mb-4 space-x-3">
              <span
                className={`text-sm font-medium ${
                  !annualBilling ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <Switch
                checked={annualBilling}
                onCheckedChange={setAnnualBilling}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={`text-sm font-medium ${
                  annualBilling ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Annual{" "}
                <Badge
                  variant="outline"
                  className="ml-1 bg-green-500/10 text-green-500 border-green-500/20"
                >
                  Save 20%
                </Badge>
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {plans.map((plan, index) => (
              <motion.div key={plan.name} variants={fadeInUp} className="flex">
                <Card
                  className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow w-full relative border ${
                    plan.popular ? "border-primary" : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      {plan.icon}
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      {plan.monthlyPrice !== null ? (
                        <>
                          <span className="text-4xl font-bold">
                            $
                            {annualBilling
                              ? plan.annualPrice
                              : plan.monthlyPrice}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                          {annualBilling && plan.monthlyPrice > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              billed annually (${plan.annualPrice * 12}/year)
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          Custom Pricing
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">
                        What's included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <Check
                              size={18}
                              className="mr-2 text-green-500 flex-shrink-0 mt-0.5"
                            />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.limitations.length > 0 && (
                        <>
                          <h4 className="text-sm font-semibold mt-4">
                            Limitations:
                          </h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, i) => (
                              <li key={i} className="flex items-start">
                                <X
                                  size={18}
                                  className="mr-2 text-red-500 flex-shrink-0 mt-0.5"
                                />
                                <span className="text-sm">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={
                        plan.name === "Enterprise"
                          ? "outline"
                          : plan.popular
                          ? "default"
                          : "secondary"
                      }
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card border rounded-xl p-8 shadow-lg max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">
                  Need a custom solution?
                </h2>
                <p className="text-muted-foreground mb-4">
                  Contact our sales team to build a custom AI executive team
                  tailored to your organization's specific requirements and
                  workflows.
                </p>
                <Button size="lg" variant="default">
                  Schedule a Demo
                </Button>
              </div>
              <div className="md:w-1/3 hidden md:block">
                <div className="relative h-32 w-32 mx-auto">
                  <motion.div
                    animate={{
                      rotate: [0, 10, 0, -10, 0],
                      y: [0, -5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Building size={48} className="text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {[
                {
                  question: "How do the AI executives work?",
                  answer:
                    "Our AI executives use advanced deep learning models combined with your company's data to provide personalized insights, strategies, and solutions tailored to your business needs.",
                },
                {
                  question: "Can I personalize the AI executives?",
                  answer:
                    "Yes! You can personalize your AI executives by providing company information, goals, policies, and other relevant data during setup to ensure they align with your organization's vision.",
                },
                {
                  question: "How secure is my company data?",
                  answer:
                    "We use enterprise-grade encryption and security practices to protect your data. All information is stored securely in Supabase with strict access controls.",
                },
                {
                  question: "Can I upgrade or downgrade my plan?",
                  answer:
                    "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
                },
                {
                  question: "Do you offer a free trial?",
                  answer:
                    "Yes, our Free plan allows you to explore the platform with limited features. You can upgrade to a paid plan anytime to access more capabilities.",
                },
                {
                  question: "How often can I have board meetings?",
                  answer:
                    "Board meeting frequency depends on your plan - monthly for Basic, weekly for Advanced, and unlimited for Enterprise plans.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
