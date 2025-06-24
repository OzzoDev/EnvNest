"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getFirstErrorMessage } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { useOrgStore } from "@/store/orgStore";
import { useEffect } from "react";
import { Org } from "@/types/types";
import { useOrgContext } from "@/context/OrgContext";

const formSchema = z.object({
  name: z
    .string({ message: "Organization name is required" })
    .nonempty({ message: "Organization name is required" }),
});

type FormData = z.infer<typeof formSchema>;

const getDefaultValues = (org: Org | null | undefined): FormData => {
  return { name: org ? org.name : "" };
};

const OrganizationForm = () => {
  const { selectedTab } = useOrgContext();
  const setSelectedOrg = useOrgStore((state) => state.setOrg);
  const selectedOrg = useOrgStore((state) => state.org);
  const setIsSaved = useOrgStore((state) => state.setIsSaved);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(selectedOrg),
  });

  const {
    register,
    reset,
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    reset({ name: "" });
  }, [selectedTab]);

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

  useEffect(() => {
    reset(getDefaultValues(selectedOrg));
  }, [selectedOrg]);

  const { mutate: createOrg, isPending: isCreatingOrg } = trpc.organization.create.useMutation({
    onMutate: () => {
      setSelectedOrg(undefined);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization created successfully");

      reset(getDefaultValues(null));

      setSelectedOrg(null);
    },
  });

  const { mutate: udpateOrg, isPending: isUpdatingOrg } = trpc.organization.update.useMutation({
    onMutate: () => {
      setSelectedOrg(undefined);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization updated successfully");

      reset(getDefaultValues(null));

      setSelectedOrg(null);
    },
  });

  const onSumbit: SubmitHandler<FormData> = (data) => {
    if (selectedOrg) {
      udpateOrg({ orgId: selectedOrg.id, name: data.name });
    } else {
      createOrg(data.name);
    }
  };

  const onError: SubmitErrorHandler<FormData> = (errors) => {
    toast.error(getFirstErrorMessage(errors));
  };

  const isLoadingUi = isCreatingOrg || isUpdatingOrg;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-lg">{selectedOrg ? "Update organization" : "Create new organization"}</p>
      <form
        onSubmit={handleSubmit(onSumbit, onError)}
        className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <Input {...register("name")} placeholder="Organization name" className="w-[240px]" />
        <div className="flex gap-4">
          <Button disabled={selectedOrg ? selectedOrg.name === getValues("name") : false}>
            {selectedOrg ? "Update" : "Create"}
            {isLoadingUi && <Loader2 className="animate-spin h-5 w-5" />}
          </Button>
          {selectedOrg && (
            <Button onClick={() => setSelectedOrg(undefined)} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
