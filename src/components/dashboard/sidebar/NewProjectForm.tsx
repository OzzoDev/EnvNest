"use client";

import { FormEvent, useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import React from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "@/components/utils/ModeSelect";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { GoPlus } from "react-icons/go";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVirtualQuery } from "@/hooks/use-virtual-query";
import { GithubRepo, OrgTable } from "@/types/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Select from "@/components/utils/Select";

const NewProjectForm = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [repo, setRepo] = useState<string | null>(null);
  const [org, setOrg] = useState<string | null>(null);
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const setSecret = useProjectStore((state) => state.setSecret);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);
  const isSaved = useProjectStore((state) => state.isSaved);
  const setLoadingStates = useSidebarStore((state) => state.setLoadingStates);
  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);

  const {
    data: repos = [],
    isLoading: isLoadingRepos,
    refetch: refetchRepos,
  } = useVirtualQuery<GithubRepo[]>(
    () => trpc.github.getAvailableRepos.useQuery(undefined, { retry: false }),
    [],
    "repos"
  );

  const {
    data: orgs = [],
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
  } = useVirtualQuery<OrgTable[]>(
    () => trpc.organization.getAsAdmin.useQuery(undefined, { retry: false }),
    [],
    "orgs"
  );

  const { mutate: createProject, isPending: isCreatingProject } = trpc.project.create.useMutation({
    onError: () => {
      toast.error("Error creating new project");
    },
    onSuccess: (data) => {
      setRepo(null);
      setProjectId(data.id);
      setSecretId(null);
      setSecret(null);
      setIsSaved(true);
      refetchRepos();
      isMobile && toggleSidebar();
      toast.success(`Project ${data.full_name} created successfully`);
    },
  });

  useEffect(() => {
    refetchRepos();
    refetchOrgs();
  }, [projectId]);

  useEffect(() => {
    setLoadingStates([isLoadingRepos, isCreatingProject]);
  }, [isLoadingRepos, isCreatingProject]);

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

  const isLoadingUI = isLoadingRepos || isLoadingOrgs || isLoadingSidebar;

  return (
    <SkeletonWrapper skeletons={2} isLoading={isLoadingUI} className="flex flex-col gap-y-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-y-4 w-fit">
        <p className="text-lg text-text-color">Create a new project</p>
        <ModeSelect
          searchPlaceholder="Search repositories..."
          emptyPlaceHolder="No repository found"
          selectPlaceholder="Select a repository"
          enableSearch={true}
          value={repo}
          options={repos.map((rep) => rep.full_name)}
          onSelect={(rep) => setRepo(rep)}
        />
        {repo &&
          (isSaved ? (
            <>
              {canCreateInOrg() ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="secondary">
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
                <Button type="submit" variant="secondary">
                  Create
                </Button>
              )}
            </>
          ) : (
            <>
              {canCreateInOrg() ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="secondary">
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
                  <Button variant="secondary">Create</Button>
                </AlertDialog>
              )}
            </>
          ))}
      </form>
    </SkeletonWrapper>
  );
};

export default NewProjectForm;
