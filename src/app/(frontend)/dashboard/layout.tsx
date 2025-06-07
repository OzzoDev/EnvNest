import { getRepos } from "@/api/github/getRepos";
import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import SecretHistoryLog from "@/components/dashboard/SecretHistoryLog";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import NewProjectForm from "@/components/NewProjectForm";
import ProjectList from "@/components/ProjectList";
import ProjectWatcher from "@/components/ProjectWatcher";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const DashboardLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/auth");
  }

  const repos = await getRepos(session.accessToken, session.user?.id!);

  return (
    <>
      <div className="p-8 grid grid-cols-[3fr_7fr] grid-rows-1 min-h-screen">
        <div className="flex flex-col gap-y-12 p-6 w-[300px]">
          <div className="pb-12 border-b border-muted-foreground">
            <NewProjectForm repos={repos} />
          </div>
          <ProjectList />
          <SecretHistoryLog />
        </div>
        <div className="flex flex-col gap-y-12">
          <DashboardHeader />
          {children}
        </div>
      </div>
      <ProjectWatcher />
    </>
  );
};

export default DashboardLayout;
