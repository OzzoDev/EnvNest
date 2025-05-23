"use client";

import { signOut } from "next-auth/react";

const DashboardPage = () => {
  return (
    <div>
      hello<button onClick={() => signOut({ callbackUrl: "/auth" })}>Log out</button>
    </div>
  );
};

export default DashboardPage;
