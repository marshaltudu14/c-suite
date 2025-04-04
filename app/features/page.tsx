"use client";

import React, { useEffect, ReactNode, ElementType } from "react"; // Import necessary types
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Users,
  Brain,
  MessageSquare,
  BarChart3,
  Shield,
  Briefcase,
  Globe,
  Layers,
  Zap,
  Clock,
  Lock,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../_components/Header";

// Define prop types for FeatureCard
interface FeatureCardProps {
  icon: ElementType; // Type for a component like Lucide icons
  title: string;
  description: string;
  isNew?: boolean; // Optional prop
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, isNew = false }) => {
  return (
    <Card className="border border-border bg-card h-full overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          {isNew && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              NEW
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

const FeaturesPage = () => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background z-0" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-6"
            >
              <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-3 py-1 w-fit">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  Revolutionary AI Platform
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Transform Your Business with{" "}
                <span className="text-primary">AI Executives</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Leverage specialized AI agents that act as virtual executives
                and employees tailored to your company&apos;s needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" className="font-medium">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="font-medium">
                  Book a Demo
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto w-full max-w-md md:max-w-full"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 backdrop-blur-sm bg-background/80 rounded-lg border border-border p-4 shadow-lg">
                    <div className="flex items-center space-x-2 border-b pb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="text-xs text-muted-foreground ml-2">
                        AI Executive Meeting
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-2 h-full">
                      <div className="space-y-2">
                        <div className="h-6 w-3/4 bg-primary/20 rounded animate-pulse" />
                        <div className="h-4 w-full bg-primary/10 rounded" />
                        <div className="h-4 w-5/6 bg-primary/10 rounded" />
                        <div className="h-4 w-4/6 bg-primary/10 rounded" />
                      </div>
                      <div className="flex justify-end items-start">
                        <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                          <Brain className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-24 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Enterprise-Grade{" "}
                <span className="text-primary">AI Technology</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Our platform combines cutting-edge AI with intuitive design to
                create a seamless experience for businesses of all sizes.
              </p>
            </motion.div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto pb-2">
              <TabsList className="mx-auto">
                <TabsTrigger value="all">All Features</TabsTrigger>
                <TabsTrigger value="executives">AI Executives</TabsTrigger>
                <TabsTrigger value="workspace">Workspace</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Users}
                    title="AI Executive Team"
                    description="Assemble a complete executive team with AI CEO, CTO, CMO, and other specialized roles tailored to your company's needs."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Brain}
                    title="Personalized Insights"
                    description="Each AI agent delivers expertise informed by your company's specific data, mission, and industry challenges."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={MessageSquare}
                    title="Collaborative Workspace"
                    description="A dedicated environment where your team can interact with AI executives and access shared conversation history."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Briefcase}
                    title="Virtual Board Meetings"
                    isNew={true}
                    description="Schedule and facilitate strategic planning sessions where AI executives interact with each other and your team."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Shield}
                    title="Enterprise Security"
                    description="Bank-level encryption and privacy controls ensure your company's data and conversations remain secure."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={BarChart3}
                    title="Data-Driven Strategy"
                    description="AI executives analyze your data to identify opportunities, predict trends, and recommend actionable strategies."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Globe}
                    title="Industry Expertise"
                    description="Our AI is trained across various industries and can adapt to your specific market challenges and opportunities."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Layers}
                    title="Customizable Roles"
                    description="Create specialized AI agents for unique roles specific to your company's organizational structure."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Zap}
                    title="RAG Technology"
                    isNew={true}
                    description="Retrieval-Augmented Generation ensures AI responses are always informed by your latest company information."
                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="executives">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Users}
                    title="AI Executive Team"
                    description="Assemble a complete executive team with AI CEO, CTO, CMO, and other specialized roles tailored to your company's needs."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Brain}
                    title="Personalized Insights"
                    description="Each AI agent delivers expertise informed by your company's specific data, mission, and industry challenges."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Users}
                    title="AI Executive Team"
                    description="Assemble a complete executive team with AI CEO, CTO, CMO, and other specialized roles tailored to your company's needs."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Globe}
                    title="Industry Expertise"
                    description="Our AI is trained across various industries and can adapt to your specific market challenges and opportunities."
                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="workspace">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={MessageSquare}
                    title="Collaborative Workspace"
                    description="A dedicated environment where your team can interact with AI executives and access shared conversation history."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Briefcase}
                    title="Virtual Board Meetings"
                    isNew={true}
                    description="Schedule and facilitate strategic planning sessions where AI executives interact with each other and your team."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Clock}
                    title="Conversation History"
                    description="Access complete records of all interactions with AI executives for reference and continuity."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Share2}
                    title="Team Collaboration"
                    description="Invite team members to participate in executive discussions and planning sessions."
                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="integration">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Shield}
                    title="Enterprise Security"
                    description="Bank-level encryption and privacy controls ensure your company's data and conversations remain secure."
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Lock}
                    title="Role-Based Access"
                    description="Control who can access which AI executives and what company information they can view." // No apostrophe here, but checking just in case
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FeatureCard
                    icon={Zap}
                    title="RAG Technology"
                    isNew={true}
                    description="Retrieval-Augmented Generation ensures AI responses are always informed by your latest company information."
                  />
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                How <span className="text-primary">It Works</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Get started with your AI executive team in just a few simple
                steps
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative mx-auto max-w-5xl">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2 hidden md:block" />

            {[
              {
                number: 1,
                title: "Create Your Workspace",
                description:
                  "Set up your company profile with key information about your mission, vision, industry, and size.",
              },
              {
                number: 2,
                title: "Select Your AI Executives",
                description:
                  "Choose from a range of specialized AI roles that align with your business needs and objectives.",
              },
              {
                number: 3,
                title: "Start Collaborating",
                description:
                  "Begin interacting with your AI executive team through chat or schedule virtual board meetings.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-background rounded-lg p-6 border border-border shadow-sm h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="h-0.5 w-full bg-primary/20 ml-4 hidden md:block" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-24 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Perfect for <span className="text-primary">Every Business</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                See how companies across different industries leverage our AI
                executive platform
              </p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                industry: "Startups",
                description:
                  "Access executive-level expertise without the overhead of hiring a full C-suite team.",
                icon: Zap,
              },
              {
                industry: "Small Business",
                description:
                  "Get strategic guidance and industry insights typically only available to larger enterprises.",
                icon: Briefcase,
              },
              {
                industry: "Enterprise",
                description:
                  "Augment existing leadership teams with specialized AI advisors for specific projects or departments.",
                icon: Users,
              },
              {
                industry: "E-Commerce",
                description:
                  "Leverage AI marketing and sales expertise to optimize customer journeys and increase conversions.",
                icon: Globe,
              },
              {
                industry: "Tech Companies",
                description:
                  "Accelerate product development with AI CTO insights and technical planning assistance.",
                icon: Layers,
              },
              {
                industry: "Service Providers",
                description:
                  "Improve service delivery and client satisfaction with AI-powered operational strategies.",
                icon: MessageSquare,
              },
            ].map((useCase, index) => (
              <motion.div
                key={useCase.industry}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <useCase.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">
                        {useCase.industry}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {useCase.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-background/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start working with your AI executive team today and unlock new
              possibilities for your company. {/* No apostrophe here */}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-medium">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="font-medium">
                Schedule a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
