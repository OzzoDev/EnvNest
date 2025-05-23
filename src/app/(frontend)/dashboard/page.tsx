// "use client";

import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getRepos } from "@/app/api/github/getRepos";
import axios from "axios";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  console.log("Session: ", session);

  if (!session?.accessToken) {
    redirect("/auth");
  }

  const repos = await getRepos(session.accessToken);

  console.log("Repos: ", repos);

  return (
    <div>
      hello
      {/* <button onClick={() => signOut({ callbackUrl: "/auth" })}>Log out</button> */}
    </div>
  );
};

export default DashboardPage;
