// "use client";

import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { signOut } from "next-auth/react";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  console.log("Session: ", session);

  return (
    <div>
      hello
      {/* <button onClick={() => signOut({ callbackUrl: "/auth" })}>Log out</button> */}
    </div>
  );
};

export default DashboardPage;
