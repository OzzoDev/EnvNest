"use client";

import { trpc } from "@/trpc/client";
import { Button } from "../ui/button";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTemplateStore } from "@/store/templateStore";
import { cn } from "@/lib/utils";
import AlertDialog from "../utils/AleartDialog";
import { toast } from "sonner";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";

const TemplateList = () => {
  const selectedTemplate = useTemplateStore((state) => state.template);
  const isSaved = useTemplateStore((state) => state.isSaved);
  const setTemplate = useTemplateStore((state) => state.setTemplate);

  const {
    data: templates,
    error: templatesError,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = trpc.template.getOwnAndPublic.useQuery(undefined, { retry: false, enabled: true });

  const { mutate: deleteTemplate, isPending: isDeletingTemplate } =
    trpc.template.delete.useMutation({
      onError: () => {
        toast.error("Error deleting template. Please try again");
      },
      onSuccess: () => {
        toast.success("Template deleted successfully");
        refetchTemplates();
      },
    });

  useEffect(() => {
    if (!selectedTemplate) {
      refetchTemplates();
    }
  }, [selectedTemplate]);

  const ownTemplates = useMemo(() => {
    return templates?.filter((template) => template.profile_id);
  }, [templates]);

  const isLoadingUi = isLoadingTemplates || isDeletingTemplate;

  if (ownTemplates?.length === 0) {
    return <p className="text-sm text-muted-foreground mt-6 ml-2">No templates created</p>;
  }

  if (templatesError) {
    return <p className="text-sm text-destructive mt-6 ml-2">Error loading templates</p>;
  }

  return (
    <SkeletonWrapper
      skeletons={10}
      isLoading={isLoadingUi}
      className="flex flex-col items-start gap-y-4 py-8 px-4">
      <ul className="flex flex-col items-start gap-y-4 py-8 px-4">
        {ownTemplates?.map((template, index) => (
          <div key={index} className="flex gap-4">
            <AlertDialog
              title="Delete template"
              description={`Are you sure you want to delete ${template.name}. This action can't be undone`}
              action="Delete"
              actionFn={() => deleteTemplate(template.id)}>
              <Button variant="outline" className="p-2 h-auto">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialog>
            {isSaved ? (
              <Button
                variant="ghost"
                onClick={() => setTemplate(template)}
                className={cn({ "text-primary": selectedTemplate?.name === template.name })}>
                {template.name}
              </Button>
            ) : (
              <AlertDialog
                title="Unsaved changes detected"
                description="You have an incomplete form currently in progress. Are you sure you want to override it? Please note that any unsaved progress will be lost."
                action="Continue"
                actionFn={() => setTemplate(template)}>
                <Button
                  key={index}
                  variant="ghost"
                  className={cn({ "text-primary": selectedTemplate?.name === template.name })}>
                  {template.name}
                </Button>
              </AlertDialog>
            )}
          </div>
        ))}
      </ul>
    </SkeletonWrapper>
  );
};

export default TemplateList;
