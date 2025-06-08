"use client";

import dynamic from "next/dynamic";

const EnvEditor = dynamic(() => import("../editor/EnvEditor"), { ssr: false });
const EnvCreator = dynamic(() => import("../editor/EnvCreator"), { ssr: false });

const Dashboard = () => {
  return (
    <>
      <EnvCreator />
      <EnvEditor />
    </>
  );
};

export default Dashboard;
