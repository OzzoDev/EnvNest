import { EnvironmentMap, Link } from "@/types/types";

export const ENVIRONMENTS: EnvironmentMap[] = [
  { value: "development", label: "Development" },
  { value: "production", label: "Producation" },
];

export const LINKS: Link[] = [
  { link: "/", name: "Home" },
  { link: "/auth", name: "Login" },
  { link: "/dashboard", name: "Editor" },
  { link: "/collaboration", name: "Collaboration" },
  { link: "/templates", name: "Templates" },
];
