"use client";

import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";
import ProjectList from "./ProjectList";
import ProjectWatcher from "./ProjectWatcher";
import EnvEditor from "./editor/EnvEditor";
import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const numericProjectId = Number(projectId);

  const { data: projectSecret } = trpc.project.getProjectSecret.useQuery(
    {
      projectId: numericProjectId,
    },
    {
      enabled: !!projectId && !isNaN(numericProjectId),
    }
  );

  console.log("Project secret: ", projectSecret);

  return (
    <>
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
    </>
  );
};

export default Dashboard;
