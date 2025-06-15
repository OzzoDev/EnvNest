"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FieldErrors, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { trpc } from "@/trpc/client";
import { Input } from "../ui/input";
import { useEffect } from "react";
import { getFirstErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "../ui/button";
import ModeSelect from "../utils/ModeSelect";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";
import { Loader2 } from "lucide-react";

const ROLES = ["viewer", "editor"];

const formSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .nonempty({ message: "Username is required" }),
  project: z
    .string({ message: "Project is required" })
    .nonempty({ message: "Project is required" }),
  role: z.enum(["viewer", "editor", ""]),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
  username: "",
  project: "",
  role: "",
};

const InviteForm = () => {
  const formMethods = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues });

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = formMethods;

  const {
    data: projects,
    error: projectsError,
    isLoading: isLoadingProjects,
  } = trpc.project.get.useQuery(undefined, { retry: false });

  const { mutate: addRole, isPending: isAddingRole } = trpc.collaborator.create.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Role add successfully");
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.role) {
      toast.error("Please select a role");
      return;
    }

    addRole({
      username: data.username,
      project: data.project,
      role: data.role as "viewer" | "editor",
    });
  };

  const onError = (errors: FieldErrors<FormData>) => {
    toast.error(getFirstErrorMessage(errors) || "Please leave no fields empty");
  };

  return (
    <SkeletonWrapper
      skeletons={4}
      isLoading={isLoadingProjects}
      width="w-[300px]"
      className="flex gap-x-8">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex gap-x-8">
        <Input {...register("username")} placeholder="Github username" />
        <Controller
          name="project"
          control={control}
          render={({ field }) => (
            <ModeSelect
              emptyPlaceHolder="No project found"
              selectPlaceholder="Select project"
              selectLabel="Projects"
              value={field.value}
              options={projects?.map((pro) => pro.full_name)}
              onSelect={field.onChange}
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <ModeSelect
              emptyPlaceHolder="No role found"
              selectPlaceholder="Select role"
              selectLabel="Roles"
              value={field.value}
              options={ROLES}
              onSelect={field.onChange}
            />
          )}
        />
        <Button>Add role {isAddingRole && <Loader2 className="animate-spin h-5 w-5" />}</Button>
      </form>
    </SkeletonWrapper>
  );
};

export default InviteForm;
