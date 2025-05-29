import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getRepos } from "../../../api/github/getRepos";
import Dashboard from "@/components/Dashboard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ClientOnly from "@/components/utils/ClientOnly";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/auth");
  }

  const repos = await getRepos(session.accessToken, session.user?.id!);

  return (
    <div>
      <ClientOnly>
        <Dashboard repos={repos} />
      </ClientOnly>
    </div>
  );
};

export default DashboardPage;
