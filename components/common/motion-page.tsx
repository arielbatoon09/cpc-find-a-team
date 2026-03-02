"use client";

import { motion } from "motion/react";
import React from "react";

interface MotionPageProps {
  children: React.ReactNode;
}

export function MotionPage({ children }: MotionPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a "premium" feel
      }}
    >
      {children}
    </motion.div>
  );
}
