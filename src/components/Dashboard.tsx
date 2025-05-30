"use client";

import { GithubRepo } from "@/types/types";
import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";
import { useProjectStore } from "@/store/projectStore";
import EnvCreator from "./editor/EnvCreator";

const EnvEditor = dynamic(() => import("./editor/EnvEditor"), { ssr: false });

const Dashboard = () => {
  const project = useProjectStore((state) => state.project);
  // const projectId = useProjectStore((state) => state.projectId);
  // const hasHydrated = useProjectStore((state) => state.hasHydrated);

  // const {
  //   data: projectSecret,
  //   isLoading: isFetchingProjectSecret,
  //   refetch: refetchProjectSecret,
  // } = trpc.project.getProjectSecret.useQuery(
  //   { projectId: Number(projectId) },
  //   { enabled: !!projectId && hasHydrated, retry: false }
  // );

  // const { mutate: updateProjectSecret, isPending: isUpdatingProject } =
  //   trpc.secret.updateVersion.useMutation({
  //     onSuccess: () => {
  //       refetchProjectSecret();
  //     },
  //   });

  const onSaveEnvEditor = (content: string) => {
    // updateProjectSecret({
    //   secretId: projectSecret?.secret_id ?? 0,
    //   projectId: projectSecret?.project_id ?? 0,
    //   content,
    // });
  };

  // if (isFetchingProjectSecret || isUpdatingProject) {
  //   return <p className="text-text-color">Loading project...</p>;
  // }

  return (
    <>
      <EnvCreator />
      {/* {project && (
        <div className="w-full h-full flex flex-col p-10 flex-1">
          <EnvEditor defaultValue={project.content ?? ""} onSave={onSaveEnvEditor} />
        </div>
      )} */}
    </>
  );
};

export default Dashboard;
