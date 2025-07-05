import axios from "axios";
import { Project } from "../types/types";
import { loadConfig } from "../config/config";

export const getProjects = async (): Promise<Project[]> => {
  const config = await loadConfig();
  const userId = config?.userId;
  const accessToken = config?.token;

  if (!userId || !accessToken) {
    throw new Error("userId and accessToken are required");
  }

  const { data } = await axios.get(
    "http://localhost:3000/api/auth/cli/projects",
    {
      params: { userId, accessToken },
    }
  );

  return (
    data.projects.map((project: { id: number; full_name: string }) => ({
      id: project.id,
      name: project.full_name,
    })) || []
  );
};
