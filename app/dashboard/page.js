"use client";

import { motion } from "framer-motion";

// Sample data for cards
const services = [
  {
    title: "Technology",
    description:
      "Cutting-edge solutions for your tech needs. Whether AI, web dev, or mobile apps.",
    bgColor: "from-purple-600 to-indigo-600",
  },
  {
    title: "Marketing",
    description:
      "Digital marketing strategies, brand building, and data-driven campaigns.",
    bgColor: "from-pink-600 to-rose-600",
  },
  {
    title: "Finance",
    description:
      "Financial planning, investment advice, and cost optimization solutions.",
    bgColor: "from-green-600 to-emerald-600",
  },
  {
    title: "Design",
    description:
      "User-centric product design, stunning interfaces, and engaging experiences.",
    bgColor: "from-orange-600 to-amber-600",
  },
];

export default function Dashboard() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Heading Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
          ChatBot Services
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Choose from a variety of specialized chatbot services. Streamline your
          operations and enhance customer experiences.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            className="rounded-xl shadow-lg overflow-hidden cursor-pointer flex flex-col justify-between bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Card Header with gradient background */}
            <div
              className={`p-6 bg-gradient-to-r ${service.bgColor} text-white`}
            >
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p className="text-sm opacity-90">{service.description}</p>
            </div>

            {/* Action Button / Footer */}
            <div className="p-4 flex justify-end">
              <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                Explore
              </button>
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
