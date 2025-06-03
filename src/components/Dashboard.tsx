"use client";

import { GithubRepo } from "@/types/types";
import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";
import { useProjectStore } from "@/store/projectStore";
import EnvCreator from "./editor/EnvCreator";

const EnvEditor = dynamic(() => import("./editor/EnvEditor"), { ssr: false });

const Dashboard = () => {
  return (
    <>
      <EnvCreator />
      <EnvEditor />
    </>
  );
};

export default Dashboard;
