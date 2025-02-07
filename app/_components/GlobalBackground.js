"use client";

import { motion } from "framer-motion";

export default function GlobalBackground() {
  return (
    <div
      className="
        fixed inset-0 -z-10
        overflow-hidden
        bg-gradient-to-br
        from-slate-50 to-slate-100
        dark:from-slate-900 dark:to-slate-950
      "
    >
      {/* Shape #1: Large rotating circle in top-left */}
      <motion.div
        className="
          absolute
          top-[-10%]
          left-[-10%]
          w-[40rem]
          h-[40rem]
          bg-gradient-to-tr
          from-sky-300 via-cyan-200 to-blue-300
          dark:from-sky-800 dark:via-cyan-900 dark:to-blue-900
          opacity-50
          rounded-full
          blur-[120px]
        "
        animate={{ rotate: 360 }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Shape #2: Medium circle rotating in bottom-right */}
      <motion.div
        className="
          absolute
          bottom-[-10%]
          right-[-15%]
          w-[28rem]
          h-[28rem]
          bg-gradient-to-br
          from-purple-300 via-pink-300 to-fuchsia-300
          dark:from-purple-800 dark:via-pink-900 dark:to-fuchsia-900
          opacity-50
          rounded-full
          blur-[120px]
        "
        animate={{ rotate: -360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Shape #3: Smaller circle with subtle horizontal float in the middle-left */}
      <motion.div
        className="
          absolute
          bottom-[25%]
          left-[5%]
          w-60
          h-60
          bg-gradient-to-bl
          from-emerald-300 via-teal-300 to-green-300
          dark:from-emerald-800 dark:via-teal-900 dark:to-green-900
          opacity-50
          rounded-full
          blur-[120px]
        "
        animate={{ x: [0, 30, -30, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
