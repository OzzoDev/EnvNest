import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getRepos } from "../../../api/github/getRepos";
import Dashboard from "@/components/Dashboard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/auth");
  }

  const repos = await getRepos(session.accessToken);

  // console.log("Repos: ", repos);

  return (
    <div>
      hello {session.user?.username}
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
