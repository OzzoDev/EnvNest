"use client";

import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";
import ClientOnly from "./utils/ClientOnly";

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  return (
    <ClientOnly>
      <NewProjectForm repos={repos} />
    </ClientOnly>
  );
};

export default Dashboard;
