"use client";

import { signOut } from "next-auth/react";

const Dashboard = () => {
  return <button onClick={() => signOut({ callbackUrl: "/auth" })}>Log out</button>;
};

export default Dashboard;
