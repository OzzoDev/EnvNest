"use client";

import Cli from "@/components/layout/Cli";
import Features from "@/components/layout/Features";
import Hero from "@/components/layout/Hero";
import ProblemVsSolutions from "@/components/layout/ProblemVsSolutions";

const HomePage = () => {
  return (
    <div style={{ scrollBehavior: "smooth" }} className="overflow-x-hidden">
      <Hero />
      <Features />
      <ProblemVsSolutions />
      <Cli />
    </div>
  );
};

export default HomePage;
