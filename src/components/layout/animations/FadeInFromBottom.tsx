"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type FadeInFromBottomProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

const FadeInFromBottom = ({
  children,
  delay = 0,
  className = "",
}: FadeInFromBottomProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeInFromBottom;
