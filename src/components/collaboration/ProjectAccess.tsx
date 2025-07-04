"use client";

import { ProjectWithCollaborators } from "@/types/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ModeSelect from "../utils/ModeSelect";
import { Input } from "../ui/input";
import { MdClose } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { ROLES } from "@/config";
import AlertDialog from "../utils/AleartDialog";

const formSchema = z.object({
  collaborators: z.array(
    z.object({
      username: z
        .string({ message: "Username is required" })
        .nonempty({ message: "Username is required" }),
      role: z.enum(["viewer", "editor"]),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

type ProjectAccessProps = {
  project: ProjectWithCollaborators;
  refetchProjects: () => void;
};

const getDefualtValues = (project: ProjectWithCollaborators): FormData => {
  return { collaborators: project.collaborators ?? [] };
};

const ProjectAccess = ({ project }: ProjectAccessProps) => {
  const [controlledProject, setControlledProject] =
    useState<ProjectWithCollaborators>(project);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefualtValues(controlledProject),
  });

  const { control, getValues, setValue, register, watch, handleSubmit, reset } =
    formMethods;

  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    reset(getDefualtValues(controlledProject));
  }, [controlledProject]);

  const { mutate: removeCollaborator, isPending: isRemovingCollaborator } =
    trpc.collaborator.delete.useMutation({
      onError: (err) => {
        toast.error(err.message || "Something went wrong. Please try again");
      },
      onSuccess: (data) => {
        toast.success("Collaborator removed successfully");

        setControlledProject((prev) => ({
          ...prev,
          collaborators: (prev.collaborators ?? []).filter(
            (col) => col.role !== data.role && col.username !== data.username
          ),
        }));
      },
    });

  const { mutate: addCollaboratror, isPending: isAddingCollaborator } =
    trpc.collaborator.create.useMutation({
      onError: (err) => {
        const errorMessage = err.message;

        if (!errorMessage) {
          toast.error("Something went wrong. Please try again");
          return;
        }

        const [message, errorUsername] = errorMessage.split("username:");

        const errorMsg = errorUsername
          ? `${message} '${errorUsername}'`
          : err.message;

        toast.error(errorMsg);

        setValue(
          "collaborators",
          getValues("collaborators").map((val) => ({
            ...val,
            username: val.username === errorUsername ? "" : val.username,
          }))
        );
      },
      onSuccess: (data) => {
        const safeData: { username: string; role: "viewer" | "editor" } = {
          username: data.username,
          role:
            data.role === "viewer" || data.role === "editor"
              ? data.role
              : "viewer",
        };

        toast.success("Collaborator added successfully");

        setControlledProject((prev) => ({
          ...prev,
          collaborators: [...(prev.collaborators ?? []), safeData],
        }));
      },
    });

  const { mutate: updateRole, isPending: isUpdatingRole } =
    trpc.collaborator.update.useMutation({
      onError: (err) => {
        toast.error(err.message || "Something went wrong. Please try again");
      },
      onSuccess: (data) => {
        const safeData: { username: string; role: "viewer" | "editor" } = {
          username: data.username,
          role:
            data.role === "viewer" || data.role === "editor"
              ? data.role
              : "viewer",
        };

        toast.success("Role updated successfuly");

        setControlledProject((prev) => ({
          ...prev,
          collaborators: (prev.collaborators ?? []).map((col) =>
            col.username === safeData.username ? safeData : col
          ),
        }));
      },
    });

  const numCollaborators = controlledProject.collaborators?.length ?? 0;

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

  const handleRemoveCollaborator = (index: number) => {
    const collaborator = controlledProject.collaborators?.[index];

    if (collaborator) {
      removeCollaborator({
        projectId: controlledProject.project_id,
        username: collaborator?.username,
      });
    } else {
      remove(index);
    }
  };

  const isEmptyField = (index: number) => {
    const field = watch(`collaborators.${index}`);
    return !field?.username && field?.role === "viewer";
  };

  const onSubmit = (data: FormData, index: number) => {
    const { role, username } = data.collaborators[index];

    const collaborators = getValues("collaborators");
    const usernames = collaborators.map((col) => col.username);
    const duplicates = new Set(usernames);

    if (duplicates.size !== usernames.length) {
      toast.error("You cannot add the same user twice inside the same project");

      setValue(
        "collaborators",
        getValues("collaborators").map((val, index) => ({
          ...val,
          username:
            index === usernames.lastIndexOf(val.username) ? "" : val.username,
        }))
      );

      return;
    }

    const isNew = !controlledProject.collaborators?.[index];

    if (isNew) {
      addCollaboratror({
        project: controlledProject.full_name,
        username,
        role,
      });
    } else {
      updateRole({ projectId: project.project_id, username, role });
    }
  };

  const isLoadingUi =
    isRemovingCollaborator || isAddingCollaborator || isUpdatingRole;

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={() => setIsVisible((prev) => !prev)}
      className="w-full flex flex-col p-0 overflow-hidden"
    >
      <AccordionItem value="item-1" className="flex flex-col border-0 w-full">
        <AccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex justify-between w-full text-muted-foreground"
          )}
        >
          <p className="text-sm sm:text-lg ">{controlledProject.full_name}</p>
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
          <div className="flex flex-col gap-y-8 p-2 py-6 sm:p-6 w-full">
            <div className="flex items-center gap-8">
              <Button
                onClick={appendField}
                variant="secondary"
                className="self-start"
              >
                <FiPlus />
              </Button>
              {!controlledProject.collaborators ||
                (controlledProject.collaborators.length === 0 && (
                  <p className="text-muted-foreground text-base">
                    No collaborators has access to this project
                  </p>
                ))}
            </div>
            <ul className="flex flex-col items-center md:items-start gap-y-8 md:gap-y-4 lg:gap-y-8 border-t pt-8 w-full md:w-fit">
              {projectCollaborator.map((collaborator, index) => (
                <form
                  key={collaborator.id}
                  onSubmit={handleSubmit((data) => onSubmit(data, index))}
                  className="flex flex-col md:flex-row gap-4 lg:gap-8 gap-y-4 w-fit md:w-full"
                >
                  <AlertDialog
                    title="Remove collaborator"
                    description={`Are you sure you want remove ${collaborator.username} as a collaborator`}
                    action="Remove"
                    actionFn={() => handleRemoveCollaborator(index)}
                    unsafe={isEmptyField(index)}
                  >
                    <Button type="button" variant="outline" className="w-fit">
                      <MdClose />
                    </Button>
                  </AlertDialog>
                  <Input
                    {...register(`collaborators.${index}.username`)}
                    placeholder="Github username"
                    disabled={!!controlledProject.collaborators?.[index]}
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
                  <Button
                    className="w-full"
                    disabled={
                      controlledProject.collaborators?.[index]
                        ? getValues("collaborators")[index].role ===
                          controlledProject.collaborators?.[index].role
                        : false
                    }
                  >
                    {controlledProject.collaborators?.[index]
                      ? "Update"
                      : "Add"}
                    {isLoadingUi && (
                      <Loader2 className="animate-spin h-4 w-4" />
                    )}
                  </Button>
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
