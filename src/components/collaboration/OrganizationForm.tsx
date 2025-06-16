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

const formSchema = z.object({
  name: z
    .string({ message: "Organization name is required" })
    .nonempty({ message: "Organization name is required" }),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = { name: "" };

const OrganizationForm = () => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { register, reset, handleSubmit } = formMethods;

  const { mutate: createOrg, isPending: isCreatingOrg } = trpc.organization.create.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization created successfully");

      reset(defaultValues);
    },
  });

  const onSumbit: SubmitHandler<FormData> = (data) => {
    createOrg(data.name);
  };

  const onError: SubmitErrorHandler<FormData> = (errors) => {
    toast.error(getFirstErrorMessage(errors));
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-lg">Create a new organization</p>
      <form onSubmit={handleSubmit(onSumbit, onError)} className="flex gap-8">
        <Input {...register("name")} placeholder="Organization name" className="w-[240px]" />
        <Button>Create {isCreatingOrg && <Loader2 className="animate-spin h-5 w-5" />}</Button>
      </form>
    </div>
  );
};

export default OrganizationForm;
