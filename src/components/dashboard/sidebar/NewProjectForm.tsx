"use client";

import { FormEvent, useState } from "react";
import React from "react";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "@/components/utils/ModeSelect";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { useSidebar } from "@/components/ui/sidebar";
import { GoPlus } from "react-icons/go";
import { useSidebarStore } from "@/store/sidebarStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Select from "@/components/utils/Select";
import { useDashboardContext } from "@/context/DashboardContext";

const NewProjectForm = () => {
  const isSaved = useProjectStore((state) => state.isSaved);
  const sidebarOpen = useSidebarStore((state) => state.sidebarOpen);
  const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);

  const { state, isMobile, toggleSidebar } = useSidebar();
  const [org, setOrg] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { repos, orgs, repo, createProject, setRepo } = useDashboardContext();

  const onSubmit = (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!repo) {
      return;
    }

    const repoData = repos.find((rep) => rep.full_name === repo);

    if (!repoData) {
      return;
    }

    const orgId = orgs.find((o) => o.name === org)?.id;

    createProject({
      repo_id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      owner: repoData.owner.login!,
      url: repoData.html_url,
      isPrivate: repoData.private,
      orgId,
    });
  };

  if (state === "collapsed" && !isMobile) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <GoPlus size={28} />
      </Button>
    );
  }

  const canCreateInOrg = (): boolean => {
    const repoData = repos.find((rep) => rep.full_name === repo);

    if (!repoData || repoData.private || !orgs || orgs.length === 0) {
      return false;
    }

    return true;
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4 w-fit">
      <p className="text-lg text-text-color">Create a new project</p>
      <ModeSelect
        searchPlaceholder="Search repositories..."
        emptyPlaceHolder="No repository found"
        selectPlaceholder="Select a repository"
        enableSearch={true}
        openTrigger={sidebarOpen}
        setOpenTrigger={setSidebarOpen}
        value={repo}
        options={repos.map((rep) => rep.full_name)}
        onSelect={(rep) => setRepo(rep)}
      />
      {repo &&
        (isSaved ? (
          <>
            {canCreateInOrg() ? (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button disabled={isPopoverOpen} type="button">
                    Create
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-8 w-[240px] bg-background">
                  <p className="text-sm text-muted-foreground">
                    Want to share this project with your team? Create it under an organization to
                    give members access.
                  </p>
                  <Select
                    placeholder="Select organization"
                    label="Organizations"
                    data={orgs.map((o) => o.name)}
                    onSelect={(o) => setOrg(o)}
                  />
                  <div className="flex flex-col gap-4">
                    <Button
                      type="button"
                      onClick={() => onSubmit()}
                      disabled={!org}
                      variant="default"
                      className="w-full">
                      Create
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onSubmit()}
                      variant="outline"
                      className="w-full">
                      Set private
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button type="submit">Create</Button>
            )}
          </>
        ) : (
          <>
            {canCreateInOrg() ? (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button disabled={isPopoverOpen} type="button">
                    Create
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-8 w-[240px] bg-background">
                  <p className="text-sm text-muted-foreground">
                    Want to share this project with your team? Create it under an organization to
                    give members access.
                  </p>
                  <Select
                    placeholder="Select organization"
                    label="Organizations"
                    data={orgs.map((o) => o.name)}
                    onSelect={(o) => setOrg(o)}
                  />
                  <div className="flex flex-col gap-4">
                    <AlertDialog
                      title="Create new project with unsaved changes?"
                      description="You current project is unsaved. Any unsaved changes will be lost. This action cannot be undone. Are you sure you want to continue?"
                      action="Create"
                      actionFn={() => onSubmit()}>
                      <Button variant="default">Create</Button>
                    </AlertDialog>
                    <AlertDialog
                      title="Create new project with unsaved changes?"
                      description="You current project is unsaved. Any unsaved changes will be lost. This action cannot be undone. Are you sure you want to continue?"
                      action="Create"
                      actionFn={() => onSubmit()}>
                      <Button variant="outline">Create</Button>
                    </AlertDialog>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <AlertDialog
                title="Create new project with unsaved changes?"
                description="You current project is unsaved. Any unsaved changes will be lost. This action cannot be undone. Are you sure you want to continue?"
                action="Create"
                actionFn={() => onSubmit()}>
                <Button>Create</Button>
              </AlertDialog>
            )}
          </>
        ))}
    </form>
  );
};

export default NewProjectForm;
