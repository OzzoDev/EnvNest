import axios, { AxiosError } from "axios";
import { Project } from "../types/types";
import { loadConfig } from "../config/config";
import { SERVER_URL } from "../config";

export const getProjects = async (): Promise<Project[]> => {
  const config = await loadConfig();
  const userId = config?.userId;
  const accessToken = config?.token;

  if (!userId || !accessToken) {
    throw new Error("userId and accessToken are required");
  }

  const response = await axios.get(`${SERVER_URL}/projects`, {
    params: { userId, accessToken },
  });

  const projectsData = response.data.projects;

  if (!Array.isArray(projectsData)) {
    throw new Error("Invalid response format: projects is not an array");
  }

  return projectsData.map((project: { id: number; full_name: string }) => ({
    id: project.id,
    name: project.full_name,
  }));
};
