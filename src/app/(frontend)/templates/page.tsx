"use client";

import NewTemplateForm from "@/components/templates/NewTemplateForm";
import TemplateList from "@/components/templates/TemplateList";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MdErrorOutline } from "react-icons/md";

const TemplatesPage = () => {
  const [isReadyToRender, setIsReadyToRender] = useState<boolean>(false);

  const {
    data: templates,
    error: templatesError,
    isLoading: isLoadingTemplates,
    isFetching: isFetchingTemplates,
    refetch: refetchTemplates,
  } = trpc.template.getOwnAndPublic.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (!isLoadingTemplates && !isFetchingTemplates && !isReadyToRender) {
      setIsReadyToRender(true);
    }
  }, [isLoadingTemplates, isFetchingTemplates]);

  if (!isReadyToRender) {
    return (
      <div className="flex flex-col items-center justify-center h-screen relative w-full">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-20">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (templatesError) {
    return (
      <div className="pt-44 flex flex-col gap-y-16 items-center">
        <MdErrorOutline size={48} className="text-destructive" />
        <p className="text-center text-2xl text-destructive font-medium">
          {templatesError.message}
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse lg:grid grid-cols-[2fr_8fr] gap-y-20 pt-6 px-6 lg:px-20 min-h-screen">
      <div>
        <h4 className="text-lg text-text-color">Your templates</h4>
        <TemplateList
          templates={templates ?? []}
          setIsLoading={(isLoading) => setIsReadyToRender(!isLoading)}
          refetchTemplates={refetchTemplates}
        />
      </div>

      <div className="flex flex-col items-center lg:px-20">
        <h2 className="mb-16 mt-12 text-xl text-text-color">
          Create a template to easily and quickly set up <code>.env</code> files in your project.
          Choose a visibility option to keep the template private or share it within your
          organization.
        </h2>
        <h3 className="mb-20 self-start text-destructive">
          Warning: Do not include any sensitive or secret values in the template, as its content is
          not encrypted and can be viewed in plain text.
        </h3>
        <NewTemplateForm />
      </div>
    </div>
  );
};

export default TemplatesPage;
