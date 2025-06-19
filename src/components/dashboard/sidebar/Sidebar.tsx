"use client";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import NewProjectForm from "./NewProjectForm";
import ProjectList from "./ProjectList";
import SecretHistoryLog from "./SecretHistoryLog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import { GrProjects } from "react-icons/gr";
import { LuHistory } from "react-icons/lu";
import { useSidebarStore } from "@/store/sidebarStore";
import { MdErrorOutline } from "react-icons/md";
import { useState } from "react";

const Sidebar = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const error = useSidebarStore((state) => state.error);
  const [hasHistoryLogs, setHasHistoryLogs] = useState<boolean>(true);
  const [hasProjects, setHasProjects] = useState<boolean>(true);

  const isCollapsed = state === "collapsed";

  return (
    <>
      {isMobile && isCollapsed && (
        <div className="flex flex-col gap-y-8 px-1 pt-2 border-r border-muted min-w-fit">
          <Button onClick={toggleSidebar} variant="ghost" className="px-2">
            <GoPlus size={28} />
          </Button>
          {hasProjects && (
            <Button onClick={toggleSidebar} variant="ghost" className="px-2">
              <GrProjects size={24} />
            </Button>
          )}
          {hasHistoryLogs && (
            <Button onClick={toggleSidebar} variant="ghost" className="px-2">
              <LuHistory size={24} />
            </Button>
          )}
        </div>
      )}
      <SidebarRoot collapsible="icon" className="border-r border-muted">
        <SidebarContent className={cn("bg-background overflow-hidden")}>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu
                className={cn(
                  "flex flex-col gap-y-8 full ",
                  isCollapsed ? "px-1" : "px-6",
                  { "pt-28": isCollapsed && !isMobile },
                  { "pt-28": !isCollapsed && !isMobile },
                  { "px-4 pt-4": isMobile }
                )}>
                <div className="flex flex-col">
                  {(!isCollapsed || isMobile) && (
                    <Button onClick={toggleSidebar} variant="ghost" className="self-end mb-4">
                      <IoMdClose size={20} />
                    </Button>
                  )}
                  {error && !isCollapsed ? (
                    <div className="pt-44 flex flex-col gap-y-12 items-center">
                      <MdErrorOutline size={32} className="text-destructive" />
                      <p className="text-center text-lg text-destructive font-medium">{error}</p>
                      <Button onClick={() => window.location.reload()}>Try again</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-y-8 w-full">
                      <NewProjectForm />
                      <ProjectList setHasProjects={setHasProjects} />
                      <SecretHistoryLog setHasHistoryLogs={setHasHistoryLogs} />
                    </div>
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarRoot>
    </>
  );
};

export default Sidebar;
