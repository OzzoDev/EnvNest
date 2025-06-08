import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { GithubRepo } from "@/types/types";
import NewProjectForm from "./NewProjectForm";
import ProjectList from "./ProjectList";
import SecretHistoryLog from "./SecretHistoryLog";

type SidebarProps = {
  repos: GithubRepo[];
};

const Sidebar = ({ repos }: SidebarProps) => {
  return (
    <SidebarRoot className="border-r border-muted">
      <SidebarContent className="bg-background">
        <SidebarGroup className=" p-0">
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-center gap-y-8 full pt-16">
              <div className="flex flex-col gap-y-8">
                <NewProjectForm repos={repos} />
                <ProjectList />
                <SecretHistoryLog />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarRoot>
  );
};

export default Sidebar;
