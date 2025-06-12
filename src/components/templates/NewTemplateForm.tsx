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

const visibilityOptions = [
  { label: "Private", value: "private" },
  { label: "Organization", value: "organization" },
];

const formSchema = z.object({
  visibility: z.enum(["private", "organization"]),
  values: z.array(z.object({ name: z.string().nonempty(), value: z.string().nonempty() })),
});

type FormData = z.infer<typeof formSchema>;

const NewTemplateForm = () => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: "private",
      values: [
        { name: "", value: "" },
        { name: "", value: "" },
        { name: "", value: "" },
        { name: "", value: "" },
      ],
    },
  });

  const { control, handleSubmit, register } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const onError = (errors: FieldErrors<FormData>) => {
    const firstError = Object.values(errors)[0];

    const message =
      typeof firstError?.message === "string" ? firstError.message : "Please leave no fields empty";

    toast.error(message);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col gap-y-8 w-full max-w-[500px]">
      <div className="flex justify-between">
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
        <Button variant="secondary" type="button" onClick={() => append({ name: "", value: "" })}>
          <FiPlus size={18} />
        </Button>
      </div>

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

      <Button type="submit" className="self-center">
        Create
      </Button>
    </form>
  );
};

export default NewTemplateForm;
