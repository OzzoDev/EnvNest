"use client";

import Features from "@/components/layout/Features";
import Hero from "@/components/layout/Hero";
import ProblemVsSolutions from "@/components/layout/ProblemVsSolutions";

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <Features />
      <ProblemVsSolutions />
    </div>
  );
};

export default HomePage;
