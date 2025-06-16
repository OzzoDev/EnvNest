"use client";

import { useOrgStore } from "@/store/orgStore";
import { OrgMember } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";
import AlertDialog from "../utils/AleartDialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MdClose } from "react-icons/md";
import { Input } from "../ui/input";
import ModeSelect from "../utils/ModeSelect";
import { ROLES } from "@/config";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";

const formSchema = z.object({
  members: z.array(
    z.object({
      username: z
        .string({ message: "Username is required" })
        .nonempty({ message: "Username is required" }),
      role: z.enum(["viewer", "editor"]),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

const getDefualtValues = (members: OrgMember[]): FormData => {
  return {
    members:
      members.map((member) => ({
        username: member.name,
        role: member.role as "viewer" | "editor",
      })) ?? [],
  };
};

const OrganizationMembers = () => {
  const members = useOrgStore((state) => state.org)?.members ?? [];
  const org = useOrgStore((state) => state.org);
  const [controlledMembers, setControlledMembers] = useState<OrgMember[]>(members);

  const formMethods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefualtValues(controlledMembers),
  });

  const { control, getValues, setValue, register, watch, handleSubmit, reset } = formMethods;

  const {
    fields: orgMembers,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "members",
  });

  const appendField = () => {
    if (controlledMembers.length >= 10) {
      toast.error("No more than 10 collaborators allowed in one project");
      return;
    }

    append({ username: "", role: "viewer" });
  };

  const handleRemoveCollaborator = (index: number) => {
    const member = controlledMembers[index];

    if (member) {
      //   removeCollaborator({
      //     projectId: controlledProject.project_id,
      //     username: collaborator?.username,
      //   });
    } else {
      remove(index);
    }
  };

  const isEmptyField = (index: number) => {
    const field = watch(`members.${index}`);
    return !field?.username && field?.role === "viewer";
  };

  const onSubmit = (data: FormData, index: number) => {};

  const isLoadingUi = false;

  if (!org) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-8 p-6">
      <div className="flex items-center gap-8">
        <Button onClick={appendField} variant="secondary" className="self-start">
          <FiPlus />
        </Button>
        {controlledMembers.length === 0 && (
          <p className="text-muted-foreground text-base">No members in this organization</p>
        )}
      </div>
      <ul className="flex flex-col gap-8 border-t pt-8 w-fit">
        {orgMembers.map((member, index) => (
          <SkeletonWrapper
            key={member.id}
            skeletons={4}
            isLoading={isLoadingUi}
            width="w-[200px]"
            className="flex gap-x-8">
            <form
              key={member.id}
              onSubmit={handleSubmit((data) => onSubmit(data, index))}
              className="flex gap-x-8">
              <AlertDialog
                title="Remove collaborator"
                description={`Are you sure you want remove ${member.username} as a member`}
                action="Remove"
                actionFn={() => handleRemoveCollaborator(index)}
                unsafe={isEmptyField(index)}>
                <Button type="button" variant="outline">
                  <MdClose />
                </Button>
              </AlertDialog>

              <Input
                {...register(`members.${index}.username`)}
                placeholder="Github username"
                disabled={!!controlledMembers[index]}
                className="w-[240px]"
              />
              <Controller
                name={`members.${index}.role`}
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
              <Button className="w-full">{controlledMembers[index] ? "Update" : "Add"}</Button>
            </form>
          </SkeletonWrapper>
        ))}
      </ul>
    </div>
  );
};

export default OrganizationMembers;
