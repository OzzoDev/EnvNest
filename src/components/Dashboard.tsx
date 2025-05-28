"use client";

import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";
import ClientOnly from "./utils/ClientOnly";
import ProjectList from "./ProjectList";

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  return (
    <ClientOnly>
      <div className="flex flex-col gap-y-12 p-6 w-[300px]">
        <div className="pb-12 border-b border-muted-foreground">
          <NewProjectForm repos={repos} />
        </div>
        <ProjectList />
      </div>
    </ClientOnly>
  );
};

export default Dashboard;
