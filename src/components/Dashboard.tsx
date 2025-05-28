"use client";

import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";
import ClientOnly from "./utils/ClientOnly";
import ProjectList from "./ProjectList";
import ProjectWatcher from "./ProjectWatcher";
import EnvEditor from "./editor/EnvEditor";

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  return (
    <ClientOnly>
      <div className="grid grid-cols-[3fr_7fr] grid-rows-1 min-h-screen">
        <div className="flex flex-col gap-y-12 p-6 w-[300px]">
          <div className="pb-12 border-b border-muted-foreground">
            <NewProjectForm repos={repos} />
          </div>
          <ProjectList />
        </div>
        <div className="w-full h-full flex flex-col p-10 flex-1">
          <p className="text-lg text-text-color">Edit .env file</p>
          <EnvEditor />
        </div>
      </div>
      <ProjectWatcher />
    </ClientOnly>
  );
};

export default Dashboard;
