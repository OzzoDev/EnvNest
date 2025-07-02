"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type SlideInProps = {
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right" | "top" | "bottom";
  className?: string;
};

const variants = {
  hiddenLeft: { opacity: 0, x: -50 },
  hiddenRight: { opacity: 0, x: 50 },
  hiddenTop: { opacity: 0, y: -50 },
  hiddenBottom: { opacity: 0, y: 50 },
  visible: { opacity: 1, x: 0, y: 0 },
};

const SlideIn = ({
  children,
  delay = 0,
  direction = "left",
  className = "",
}: SlideInProps) => {
  let hiddenVariant = "hiddenLeft";

  switch (direction) {
    case "right":
      hiddenVariant = "hiddenRight";
      break;
    case "top":
      hiddenVariant = "hiddenTop";
      break;
    case "bottom":
      hiddenVariant = "hiddenBottom";
      break;
    case "left":
    default:
      hiddenVariant = "hiddenLeft";
      break;
  }

  return (
    <motion.div
      initial={hiddenVariant}
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
