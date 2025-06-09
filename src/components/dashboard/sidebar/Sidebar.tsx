"use client";

import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import NewProjectForm from "./NewProjectForm";
import ProjectList from "./ProjectList";
import SecretHistoryLog from "./SecretHistoryLog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";
import { useSidebarStore } from "@/store/sidebarStore";
import { GoPlus } from "react-icons/go";
import { GrProjects } from "react-icons/gr";
import { LuHistory } from "react-icons/lu";

const Sidebar = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isLoading = useSidebarStore((state) => state.isLoading);
  const [isExtended, setIsExtended] = useState<boolean>(state === "expanded");

  useEffect(() => {
    setTimeout(() => {
      setIsExtended(state === "expanded");
    }, 100);
  }, [state]);

  const isCollapsed = state === "collapsed";

  return (
    <>
      {isMobile && isCollapsed && (
        <div className="flex flex-col gap-y-8 px-1 pt-2 border-r border-muted min-w-fit">
          <Button onClick={toggleSidebar} variant="ghost" className="px-2">
            <GoPlus size={28} />
          </Button>
          <Button onClick={toggleSidebar} variant="ghost" className="px-2">
            <GrProjects size={24} />
          </Button>
          <Button onClick={toggleSidebar} variant="ghost" className="px-2">
            <LuHistory size={24} />
          </Button>
        </div>
      )}
      <SidebarRoot collapsible="icon" className="border-r border-muted">
        <SidebarContent
          className={cn("bg-background", isExtended ? "overflow-y-auto" : "overflow-y-hidden")}>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu
                className={cn(
                  "flex flex-col gap-y-8 full ",
                  isCollapsed ? "px-1" : "px-6",
                  { "pt-[78px]": isCollapsed && !isMobile },
                  { "pt-24": !isCollapsed && !isMobile },
                  { "px-4 pt-6": isMobile }
                )}>
                <div className="flex flex-col">
                  {(!isCollapsed || isMobile) && (
                    <Button
                      onClick={toggleSidebar}
                      disabled={isLoading && !isMobile}
                      variant="ghost"
                      className={cn("self-end mb-4", { invisible: isLoading && !isMobile })}>
                      <IoMdClose size={20} />
                    </Button>
                  )}
                  <div className="flex flex-col gap-y-8 w-full">
                    <NewProjectForm />
                    <ProjectList />
                    <SecretHistoryLog />
                  </div>
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
