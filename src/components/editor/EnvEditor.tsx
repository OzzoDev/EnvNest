import EnvInput from "./EnvInput";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "sonner";
import SecretSelector from "./SecretSelector";
import { FiPlus } from "react-icons/fi";
import AlertDialog from "../utils/AleartDialog";
import { GrRevert } from "react-icons/gr";
import ActivityLog from "../dashboard/ActivityLog";
import { usePathname } from "next/navigation";
import { copyToClipBoard } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import { useDashboardContext } from "@/context/DashboardContext";
import { Textarea } from "../ui/textarea";

export const formSchema = z.object({
  envVariables: z.array(
    z.object({ name: z.string().nonempty(), value: z.string().nonempty() })
  ),
});

export type FormData = z.infer<typeof formSchema>;

const EnvEditor = () => {
  const pathname = usePathname();
  const [pasteValue, setPasteValue] = useState<string | null>(null);
  const [pasteDialogIsOpen, setPasteDialogIsOpen] = useState<boolean>(false);

  const {
    projectId,
    project,
    secretId,
    secret,
    showAll,
    setShowAll,
    setIsSaved,
  } = useProjectStore();

  const {
    setIsValid,
    visibleInputs,
    setVisibleInputs,
    updateMessage,
    updateSecret,
    deleteSecret,
    updateSuccess,
    isActivityLogOpen,
    setIsActicityLogOpen,
    hasWriteAccess,
    isValid,
    isOpen,
    setIsOpen,
    setUpdateMessage,
    envVariables: envs,
  } = useDashboardContext();

  const getEnvVariables = () => {
    if (!secret?.content) {
      return [];
    }

    return secret?.content.split("&&").map((val) => {
      const [name, value] = val.split("=");
      return { name, value: value || "" };
    });
  };

  const formMethods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { envVariables: getEnvVariables() },
  });

  const {
    reset,
    handleSubmit,
    getValues,
    setValue,
    control,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

  const watchedValues = useWatch({ control });

  useEffect(() => {
    const validated = formSchema.safeParse(watchedValues);
    setIsValid(validated.success);
  }, [watchedValues]);

  useEffect(() => {
    const allHidden = visibleInputs.every((input) => !input);
    const allVisible = visibleInputs.every((input) => input);

    if (showAll && allHidden) {
      setShowAll(false);
    }

    if (!showAll && allVisible) {
      setShowAll(true);
    }
  }, [visibleInputs]);

  useEffect(() => {
    setVisibleInputs(
      (watchedValues?.envVariables ?? []).map((env) => !env.value)
    );
  }, [watchedValues?.envVariables?.length]);

  useEffect(() => {
    reset({ envVariables: [] });
  }, [project]);

  useEffect(() => {
    const newValues = getEnvVariables();

    if (newValues.length) {
      replace(newValues);
    } else {
      replace([{ name: "", value: "" }]);
    }

    reset({ envVariables: newValues });
  }, [secret, pathname]);

  useEffect(() => {
    if (updateSuccess) {
      reset({ envVariables: envs });
    }
  }, [updateSuccess]);

  useEffect(() => {
    setPasteValue("");
  }, [pasteDialogIsOpen]);

  const { fields: envVariables, replace } = useFieldArray({
    control,
    name: "envVariables",
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const content = data.envVariables
      .map(({ name, value }) => `${name}=${value}`)
      .join("&&");

    updateSecret({
      projectId: Number(projectId),
      secretId: Number(secretId),
      content,
      updateMessage,
    });
  };

  const onDeleteVariable = (index: number) => {
    const envVars = getValues("envVariables");

    const name = envVars.find((_, idx) => idx === index)?.name;

    const content = envVars
      .filter((_, idx) => idx !== index)
      .map(({ name, value }) => `${name}=${value}`)
      .join("&&");

    updateSecret({
      projectId: Number(projectId),
      secretId: Number(secretId),
      content,
      type: "DELETE",
      updateMessage: `Deleted variable ${name}`,
    });
  };

  const onRevert = () => {
    reset({ envVariables: getEnvVariables() });
    setVisibleInputs(getEnvVariables().map(() => false));
  };

  const addEnvVariable = () => {
    setValue("envVariables", [
      ...getValues("envVariables"),
      { name: "", value: "" },
    ]);
  };

  const handleToggleAllInputs = () => {
    if (showAll) {
      setShowAll(false);
      setVisibleInputs((watchedValues?.envVariables ?? []).map(() => false));
    } else {
      setVisibleInputs((watchedValues?.envVariables ?? []).map(() => true));
      setShowAll(true);
    }
  };

  const renderEditor = !!secret;

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-8">
          <SecretSelector />

          {secretId && (
            <div className="flex gap-x-4">
              <ActivityLog
                isOpen={isActivityLogOpen}
                setIsOpen={setIsActicityLogOpen}
                updateSecret={updateSecret}
              />
              {hasWriteAccess && (
                <AlertDialog
                  title="Delete .env file"
                  description={`Are you sure you want to delete this .env file. This action can't be undone.`}
                  action="Delete"
                  actionFn={() => deleteSecret({ secretId, projectId })}
                >
                  <Button type="button" variant="secondary">
                    Delete
                  </Button>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {hasWriteAccess && (
          <>
            {renderEditor && (
              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addEnvVariable}
                  className="self-end w-fit"
                >
                  <FiPlus />
                </Button>

                <div className="flex items-center gap-x-4">
                  {isDirty && (
                    <AlertDialog
                      title="Revert changes"
                      description={`Are you sure you want to revert your changes`}
                      action="Revert"
                      actionFn={onRevert}
                    >
                      <Button type="button" variant="outline">
                        <GrRevert size={16} />
                      </Button>
                    </AlertDialog>
                  )}
                  {isValid ? (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        {renderEditor && (
                          <Button
                            type="button"
                            disabled={!isDirty}
                            variant="default"
                          >
                            {isDirty ? "Save Changes" : "Saved"}
                          </Button>
                        )}
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Save Your Changes</DialogTitle>
                          <DialogDescription>
                            We track the version history of your projects.
                            Please provide a brief message about the updates you
                            made for future reference.
                          </DialogDescription>
                        </DialogHeader>
                        <Label>Update Message</Label>
                        <Input
                          value={updateMessage}
                          onChange={(e) => setUpdateMessage(e.target.value)}
                          placeholder="Describe your changes..."
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            type="button"
                            disabled={!updateMessage}
                            onClick={handleSubmit((data) => {
                              onSubmit(data);
                              setIsOpen(false);
                            })}
                          >
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      type="button"
                      disabled={!isDirty}
                      variant="default"
                      onClick={() =>
                        toast.error("Please leave no fields empty")
                      }
                      className="self-end"
                    >
                      {isDirty ? "Save Changes" : "Saved"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="self-end mt-[-16px]">
          {secret && (
            <div className="flex gap-4 self-end">
              <Dialog
                open={pasteDialogIsOpen}
                onOpenChange={setPasteDialogIsOpen}
              >
                <form>
                  <DialogTrigger asChild>
                    <Button variant="ghost">Load</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Load</DialogTitle>
                      <DialogDescription>
                        Paste env variables from your .env file
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      value={pasteValue ?? ""}
                      onChange={(e) => setPasteValue(e.target.value)}
                      className="h-[200px] resize-none"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="mt-4 sm:m-0">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={() => {
                          const content = pasteValue
                            ?.split("\n")
                            .filter(Boolean)
                            .map((pair) => pair.split(/\s+/).join(""))
                            .join("&&");

                          if (!content) {
                            toast.error(
                              "Please make sure the text area is not empty. Kindly paste your content and try again."
                            );
                            return;
                          }

                          updateSecret({
                            projectId: Number(projectId),
                            secretId: Number(secretId),
                            content,
                            updateMessage: "Loaded from .env file",
                          });
                          console.log(
                            pasteValue
                              ?.split("\n")
                              .filter(Boolean)
                              .map((pair) => pair.split(/\s+/).join(""))
                              .join("&&")
                          );
                        }}
                        type="button"
                      >
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
              {envVariables && envVariables.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      copyToClipBoard(secret.content.split("&&").join("\n"))
                    }
                  >
                    Copy
                  </Button>
                  <Button variant="outline" onClick={handleToggleAllInputs}>
                    {showAll ? "Hide all" : "Show all"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {renderEditor && (
          <ul className="flex flex-col gap-y-4 lg:gap-y-8">
            {envVariables?.map((env, index) => (
              <EnvInput
                key={env.id}
                index={index}
                isVisible={visibleInputs[index] ?? true}
                setIsVisible={() =>
                  setVisibleInputs((prev) =>
                    prev.map((input, idx) =>
                      idx === index ? !prev[index] : input
                    )
                  )
                }
                onDelete={onDeleteVariable}
              />
            ))}
          </ul>
        )}
      </div>
    </FormProvider>
  );
};

export default EnvEditor;
