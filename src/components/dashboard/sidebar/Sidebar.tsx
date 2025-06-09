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
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";

const Sidebar = () => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
  const isLoading = useSidebarStore((state) => state.isLoading);
  const [isExtended, setIsExtended] = useState<boolean>(state === "expanded");

  useEffect(() => {
    setTimeout(() => {
      setIsExtended(state === "expanded");
    }, 100);
  }, [state]);

  const isCollapsed = state === "collapsed";

  return (
    <SidebarRoot collapsible="icon" className="border-r border-muted">
      <SidebarContent
        className={cn("bg-background", isExtended ? "overflow-y-auto" : "overflow-y-hidden")}>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu
              className={cn(
                "flex flex-col gap-y-8 full ",
                isCollapsed ? "px-1 pt-[78px]" : "px-6 pt-24"
              )}>
              <div className="flex flex-col">
                {!isCollapsed && (
                  <Button
                    onClick={toggleSidebar}
                    disabled={isLoading}
                    variant="ghost"
                    className={cn("self-end", { invisible: isLoading })}>
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
  );
};

export default Sidebar;
