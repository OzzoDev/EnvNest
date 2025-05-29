"use client";

import { GithubRepo } from "@/types/types";
import { trpc } from "@/trpc/client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const ProjectList = dynamic(() => import("./ProjectList"), { ssr: false });
const ProjectWatcher = dynamic(() => import("./ProjectWatcher"), { ssr: false });
const NewProjectForm = dynamic(() => import("./NewProjectForm"), { ssr: false });
const EnvEditor = dynamic(() => import("./editor/EnvEditor"), { ssr: false });

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const numericProjectId = Number(projectId);

  const {
    data: projectSecret,
    isLoading: isFetchingProjectSecret,
    refetch: refetchProjectSecret,
  } = trpc.project.getProjectSecret.useQuery(
    {
      projectId: numericProjectId,
    },
    {
      enabled: !!projectId && !isNaN(numericProjectId),
    }
  );

  const { mutate: updateProjectSecret, isPending: isUpdatingProject } =
    trpc.secret.updateVersion.useMutation({
      onSuccess: () => {
        refetchProjectSecret();
      },
    });

  const onSaveEnvEditor = (content: string) => {
    updateProjectSecret({
      secretId: projectSecret?.secret_id ?? 0,
      projectId: projectSecret?.project_id ?? 0,
      content,
    });
  };

  console.log("Project secret: ", projectSecret);

  if (isFetchingProjectSecret || isUpdatingProject) {
    return <p className="text-text-color">Loading project...</p>;
  }

  return (
    <>
      <div className="grid grid-cols-[3fr_7fr] grid-rows-1 min-h-screen">
        <div className="flex flex-col gap-y-12 p-6 w-[300px]">
          <div className="pb-12 border-b border-muted-foreground">
            <NewProjectForm repos={repos} />
          </div>
          <ProjectList />
        </div>
        {projectSecret && (
          <div className="w-full h-full flex flex-col p-10 flex-1">
            <EnvEditor defaultValue={projectSecret?.content ?? ""} onSave={onSaveEnvEditor} />
          </div>
        )}
      </div>
      <ProjectWatcher />
    </>
  );
};

export default Dashboard;
