import { useProjectStore } from "@/store/projectStore";
import EnvInput from "./EnvInput";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import SecretSelector from "./SecretSelector";
import { FiPlus } from "react-icons/fi";
import AlertDialog from "../utils/AleartDialog";
import { GrRevert } from "react-icons/gr";
import ActivityLog from "./ActivityLog";

const formSchema = z.object({
  envVariables: z.array(z.object({ name: z.string().nonempty(), value: z.string().nonempty() })),
});

const EnvEditor = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const project = useProjectStore((state) => state.project);

  const secretId = useProjectStore((state) => state.secretId);
  const secret = useProjectStore((state) => state.secret);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const deleteProjectSecretRef = useProjectStore((state) => state.deleteProjectSecretRef);

  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityLogOpen, setIsActicityLogOpen] = useState<boolean>(false);
  const [toggleResetKey, setToggleResetKey] = useState<number>(0);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);

  const formMethods = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    reset,
    handleSubmit,
    getValues,
    setValue,
    formState: { isDirty },
  } = formMethods;

  const getEnvVariables = () => {
    if (!secret?.content) {
      return [];
    }

    return secret?.content.split("&&").map((val) => {
      const [name, value] = val.split("=");
      return { name, value: value || "" };
    });
  };

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

  const watchedValues = useWatch({ control: formMethods.control });

  useEffect(() => {
    const validated = formSchema.safeParse(watchedValues);
    setIsValid(validated.success);
  }, [watchedValues]);

  useEffect(() => {
    reset({ envVariables: [] });
  }, [project]);

  useEffect(() => {
    reset({ envVariables: getEnvVariables() || [] });
  }, [secret]);

  const { fields: envVariables } = useFieldArray({
    name: "envVariables",
    control: formMethods.control,
  });

  const { mutate: updateSecret } = trpc.secret.update.useMutation({
    onMutate: () => {
      setUpdateSuccess(false);
    },
    onSuccess: (data) => {
      const envVariables = data.content.split("&&").map((val) => {
        const [name, value] = val.split("=");
        return { name, value };
      });

      reset({ envVariables });

      setToggleResetKey((prev) => prev + 1);

      setUpdateSuccess(true);
      setIsActicityLogOpen(false);

      toast.success("Successfully saved .env file");
    },
    onError: () => {
      toast.success("Error saving .env file");
    },
    onSettled: () => {
      setUpdateMessage("");
    },
  });

  const { mutate: deleteSecret } = trpc.secret.delete.useMutation({
    onSuccess: () => {
      toast.success("Successfully deleted .env file");

      deleteProjectSecretRef(projectId!);
      setSecretId(null);
    },
    onError: () => {
      toast.error("Error deleting .env file. Please try again");
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const content = data.envVariables.map(({ name, value }) => `${name}=${value}`).join("&&");

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
  };

  const addEnvVariable = () => {
    setValue("envVariables", [...getValues("envVariables"), { name: "", value: "" }]);
  };

  const renderEditor = !!secret;

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col gap-y-8">
        <div className="flex justify-between items-end">
          <SecretSelector />
          {secretId && (
            <div className="flex gap-x-4">
              <ActivityLog
                isOpen={isActivityLogOpen}
                setIsOpen={setIsActicityLogOpen}
                refetchTrigger={updateSuccess}
                updateSecret={updateSecret}
              />
              <AlertDialog
                title="Delete .env file"
                description={`Are you sure you want to delete this .env file. This action can't be undone.`}
                action="Delete"
                actionFn={() => deleteSecret({ secretId })}>
                <Button type="button" variant="secondary">
                  Delete
                </Button>
              </AlertDialog>
            </div>
          )}
        </div>

        {renderEditor && (
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={addEnvVariable}
              className="self-end w-fit">
              <FiPlus />
            </Button>

            <div className="flex items-center gap-x-4">
              {isDirty && (
                <AlertDialog
                  title="Revert changes"
                  description={`Are you sure you want to revert your changes`}
                  action="Revert"
                  actionFn={onRevert}>
                  <Button type="button" variant="outline">
                    <GrRevert size={16} />
                  </Button>
                </AlertDialog>
              )}
              {isValid ? (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    {renderEditor && (
                      <Button type="button" disabled={!isDirty} variant="default">
                        {isDirty ? "Save Changes" : "Saved"}
                      </Button>
                    )}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Save Your Changes</DialogTitle>
                      <DialogDescription>
                        We track the version history of your projects. Please provide a brief
                        message about the updates you made for future reference.
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
                        })}>
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
                  onClick={() => toast.error("Please leave no fields empty")}
                  className="self-end">
                  {isDirty ? "Save Changes" : "Saved"}
                </Button>
              )}
            </div>
          </div>
        )}

        {renderEditor && (
          <ul className="flex flex-col gap-y-8">
            {envVariables?.map((_, index) => (
              <EnvInput
                key={`${toggleResetKey}-${index}`}
                index={index}
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
