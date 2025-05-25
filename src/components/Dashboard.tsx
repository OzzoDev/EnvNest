"use client";

import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";

type DashboardProps = {
  repos: GithubRepo[];
};

const Dashboard = ({ repos }: DashboardProps) => {
  return <NewProjectForm repos={repos} />;
};

export default Dashboard;
