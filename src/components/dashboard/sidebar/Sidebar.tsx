"use client";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import NewProjectForm from "./NewProjectForm";
import ProjectList from "./ProjectList";
import SecretHistoryLog from "./SecretHistoryLog";
import { trpc } from "@/trpc/client";

const Sidebar = () => {
  return (
    <SidebarRoot className="border-r border-muted">
      <SidebarContent className="bg-background">
        <SidebarGroup className=" p-0">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-center gap-y-8 full pt-24 px-6">
              <div className="flex flex-col gap-y-8 w-full">
                <NewProjectForm />
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
