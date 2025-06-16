"use client";

import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getFirstErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  name: z
    .string({ message: "Organization name is required" })
    .nonempty({ message: "Organization name is required" }),
});

type FormData = z.infer<typeof formSchema>;

const getDefualtValues: FormData = { name: "" };

const OrganizationForm = () => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefualtValues,
  });

  const { register, handleSubmit } = formMethods;

  const onSumbit: SubmitHandler<FormData> = (data) => {
    //
  };

  const onError: SubmitErrorHandler<FormData> = (errors) => {
    toast.error(getFirstErrorMessage(errors));
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-lg">Create a new organization</p>
      <form onSubmit={handleSubmit(onSumbit, onError)} className="flex gap-8">
        <Input {...register} placeholder="Organization name" className="w-[240px]" />
        <Button>Create</Button>
      </form>
    </div>
  );
};

export default OrganizationForm;
