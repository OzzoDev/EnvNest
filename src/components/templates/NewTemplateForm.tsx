"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FieldErrors, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { useTemplateStore } from "@/store/templateStore";
import { useEffect } from "react";

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
  const template = useTemplateStore((state) => state.template);
  const setTemplate = useTemplateStore((state) => state.setTemplate);
  const setIsSaved = useTemplateStore((state) => state.setIsSaved);

  const resetFormData = () => {
    return template
      ? {
          name: template.name,
          values: template.template.split("&&").map((temp) => {
            const [name, value] = temp.split("=");
            return { name, value };
          }),
          visibility: (template.visibility || "private") as "private" | "organization",
        }
      : defaultValues;
  };
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: resetFormData(),
  });

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { isDirty },
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

  useEffect(() => {
    if (template) {
      reset(resetFormData());
    }
  }, [template]);

  const { mutate: createTemplate, isPending: isCreatingTemplate } =
    trpc.template.create.useMutation({
      onMutate: () => {
        setTemplate(undefined);
      },
      onError: (err) => {
        toast.message(err.message || "Something went wrong. Please try again");
      },
      onSuccess: () => {
        setTemplate(null);
        reset(defaultValues);
        toast.success("Template created successfully. It is now available for use");
      },
    });

  const { mutate: updateTemplate, isPending: isUpdatingTemplate } =
    trpc.template.update.useMutation({
      onMutate: () => {
        setTemplate(undefined);
      },
      onError: (err) => {
        toast.message(err.message || "Something went wrong. Please try again");
      },
      onSuccess: () => {
        setTemplate(null);
        reset(defaultValues);
        toast.success("Template updated successfully");
      },
    });

  const onSubmit = (data: FormData) => {
    if (template) {
      updateTemplate({
        templateId: template.id,
        name: data.name,
        template: data.values.map(({ name, value }) => `${name}=${value}`).join("&&"),
        visibility: data.visibility,
      });
    } else {
      createTemplate({
        name: data.name,
        template: data.values.map(({ name, value }) => `${name}=${value}`).join("&&"),
        visibility: data.visibility,
      });
    }
  };

  const onError = (errors: FieldErrors<FormData>) => {
    toast.error(getFirstErrorMessage(errors) || "Please leave no fields empty");
  };

  const cancelUpdate = () => {
    setTemplate(null);
    reset(defaultValues);
  };

  const isEmpty = fields.length === 0;

  const isLoading = isCreatingTemplate || isUpdatingTemplate;

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-y-16 w-full">
      <div className="flex items-end gap-12">
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

      <ul className="flex flex-col gap-y-12">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_1fr] gap-x-12 items-center">
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
        <div className="flex gap-x-4">
          <Button type="submit" className="flex items-center gap-2 w-fit">
            {template ? "Update" : "Create"}
            {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
          </Button>
          {template && (
            <Button type="button" variant="outline" onClick={cancelUpdate}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </form>
  );
};

export default NewTemplateForm;
