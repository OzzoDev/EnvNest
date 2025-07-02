"use client";

import Cli from "@/components/layout/Cli";
import Features from "@/components/layout/Features";
import FinalCTA from "@/components/layout/FinalCTA";
import Hero from "@/components/layout/Hero";
import ProblemVsSolutions from "@/components/layout/ProblemVsSolutions";

const HomePage = () => {
  return (
    <div style={{ scrollBehavior: "smooth" }} className="overflow-x-hidden">
      <Hero />
      <Features />
      <ProblemVsSolutions />
      <Cli />
      <FinalCTA />
    </div>
  );
};

export default HomePage;
