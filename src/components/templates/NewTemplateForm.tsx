"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { FiPlus } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { cn, getFirstErrorMessage } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

const visibilityOptions = [
  { label: "Private", value: "private" },
  { label: "Organization", value: "organization" },
];

const formSchema = z.object({
  name: z
    .string({ message: "Template name is required" })
    .nonempty({ message: "Template name is required" }),
  visibility: z.enum(["private", "organization"]),
  values: z
    .array(
      z.object({
        name: z.string({ message: "Name is required" }).nonempty({ message: "Name is required" }),
        value: z
          .string({ message: "Value is required" })
          .nonempty({ message: "Value is required" }),
      })
    )
    .min(1, { message: "At least 1 key-value pair" }),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
  name: "",
  visibility: "private",
  values: [
    { name: "", value: "" },
    { name: "", value: "" },
    { name: "", value: "" },
    { name: "", value: "" },
  ],
};

const NewTemplateForm = () => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  const { mutate: createTemplate, isPending: isCreatingTemplate } =
    trpc.template.create.useMutation({
      onError: (err) => {
        toast.message(err.message || "Something went wrong. Please try again");
      },
      onSuccess: () => {
        reset(defaultValues);
        toast.success("Template created successfully. It is now available for use");
      },
    });

  const onSubmit = (data: FormData) => {
    createTemplate({
      name: data.name,
      template: data.values.map(({ name, value }) => `${name}=${value}`).join("&&"),
      visibility: data.visibility,
    });
  };

  const onError = (errors: FieldErrors<FormData>) => {
    toast.error(getFirstErrorMessage(errors) || "Please leave no fields empty");
  };

  const isEmpty = fields.length === 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col gap-y-8 w-full max-w-[500px]">
      <div className="flex justify-between items-end gap-8">
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <div>
          <p
            aria-hidden={!!errors.name?.message}
            className={cn(
              "text-sm text-destructive mb-2",
              errors.name?.message ? "visible" : "invisible"
            )}>
            Required
          </p>
          <Input {...register("name")} placeholder="Template name" />
        </div>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            fields.length < 20
              ? append({ name: "", value: "" })
              : toast.error("Limit reached: You can only add up to 20 key-value pairs.");
          }}>
          <FiPlus size={18} />
        </Button>
      </div>

      {isEmpty && <p className="text-center text-muted-foreground">Template is empty...</p>}

      <ul className="flex flex-col gap-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_1fr] gap-x-4 items-center">
            <div className="flex gap-x-4 w-full">
              <Button type="button" variant="ghost" onClick={() => remove(index)} className="w-12">
                <MdClose />
              </Button>
              <Input placeholder="Name" {...register(`values.${index}.name`)} className="w-full" />
            </div>
            <Input placeholder="Value" {...register(`values.${index}.value`)} />
          </div>
        ))}
      </ul>

      {!isEmpty && (
        <Button type="submit" className="self-center">
          Create {isCreatingTemplate && <Loader2 className="animate-spin h-5 w-5" />}
        </Button>
      )}
    </form>
  );
};

export default NewTemplateForm;
