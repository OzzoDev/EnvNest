"use client";

import { ProjectWithCollaborators } from "@/types/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, User2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ModeSelect from "../utils/ModeSelect";
import { Input } from "../ui/input";
import { MdClose } from "react-icons/md";
import AlertDialog from "../utils/AleartDialog";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";

const ROLES = ["viewer", "editor"];

const formSchema = z.object({
  collaborators: z.array(
    z.object({
      username: z.string().nonempty("Username is required"),
      role: z.enum(["viewer", "editor"]),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

type ProjectAccessProps = {
  project: ProjectWithCollaborators;
};

const getDefualtValues = (project: ProjectWithCollaborators): FormData => {
  return { collaborators: project.collaborators ?? [] };
};

const ProjectAccess = ({ project }: ProjectAccessProps) => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefualtValues(project),
  });

  const { control, register, watch } = formMethods;

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const numCollaborators = project.collaborators?.length ?? 0;

  const {
    fields: projectCollaborator,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "collaborators",
  });

  const appendField = () => {
    if (projectCollaborator.length >= 10) {
      toast.error("No more than 10 collaborators allowed in one project");
      return;
    }

    append({ username: "", role: "viewer" });
  };

  const isEmptyField = (index: number) => {
    const field = watch(`collaborators.${index}`);
    return !field?.username && field?.role === "viewer";
  };

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={() => setIsVisible((prev) => !prev)}
      className="w-full flex flex-col p-0">
      <AccordionItem value="item-1" className="flex flex-col border-0">
        <AccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex justify-between w-full text-muted-foreground"
          )}>
          <p className="text-lg ">{project.full_name}</p>
          <div className="flex gap-4">
            {numCollaborators > 0 && (
              <div className="flex items-center gap-1">
                <User2 size={16} />
                <span>{numCollaborators}</span>
              </div>
            )}
            {isVisible ? <ChevronUp /> : <ChevronDown />}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-y-8 p-6">
            <Button onClick={appendField} variant="secondary" className="self-start">
              <FiPlus />
            </Button>
            <ul className="flex flex-col gap-y-8 border-t pt-8">
              {projectCollaborator.map((collaborator, index) => (
                <form key={collaborator.id} className="flex gap-x-8 w-fit">
                  <AlertDialog
                    title="Remove collaborator"
                    description={`Are you sure you want remove ${collaborator.username} as a collaborator`}
                    action="Remove"
                    actionFn={() => remove(index)}
                    unsafe={isEmptyField(index)}>
                    <Button type="button" variant="outline">
                      <MdClose />
                    </Button>
                  </AlertDialog>

                  <Input
                    {...register(`collaborators.${index}.username`)}
                    placeholder="Github username"
                    disabled={!!project.collaborators?.[index]}
                    className="w-[240px]"
                  />
                  <Controller
                    name={`collaborators.${index}.role`}
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
                  <Button>{project.collaborators?.[index] ? "Update" : "Add"} </Button>
                  {/* {isAddingRole && <Loader2 className="animate-spin h-5 w-5" />} */}
                </form>
              ))}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProjectAccess;
