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

const formSchema = z.object({
  envVariables: z.array(z.object({ name: z.string(), value: z.string() })),
});

const EnvEditor = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const secretId = useProjectStore((state) => state.secretId);
  const secret = useProjectStore((state) => state.secret);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);

  const [open, setOpen] = useState(false);
  const [toggleResetKey, setToggleResetKey] = useState<number>(0);
  const [updateMessage, setUpdateMessage] = useState<string>("");

  const formMethods = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    reset,
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

  useEffect(() => {
    reset({ envVariables: [] });
  }, [projectId]);

  useEffect(() => {
    const envVariables = secret?.content.split("&&").map((val) => {
      const [name, value] = val.split("=");
      return { name, value };
    });

    reset({ envVariables: envVariables ?? [] });
  }, [secret]);

  const { fields: envVariables } = useFieldArray({
    name: "envVariables",
    control: formMethods.control,
  });

  const { mutate: updateSecret } = trpc.secret.update.useMutation({
    onSuccess: (data) => {
      const envVariables = data.content.split("&&").map((val) => {
        const [name, value] = val.split("=");
        return { name, value };
      });

      reset({ envVariables });
      setToggleResetKey((prev) => prev + 1);
      toast.success("Secret saved successfully");
    },
    onError: () => {
      toast.success("Error saving secret");
    },
    onSettled: () => {
      setUpdateMessage("");
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

  if (getValues("envVariables") && getValues("envVariables").length === 0) {
    return null;
  }

  return (
    <FormProvider {...formMethods}>
      <form>
        <div className="flex flex-col gap-y-8">
          <div className="flex justify-between">
            <SecretSelector />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button" disabled={!isDirty} variant="default" className="self-end">
                  {isDirty ? "Save Changes" : "Saved"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Your Changes</DialogTitle>
                  <DialogDescription>
                    We track the version history of your projects. Please provide a brief message
                    about the updates you made for future reference.
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
                      setOpen(false);
                    })}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ul className="flex flex-col gap-y-8">
            {envVariables?.map((_, index) => (
              <EnvInput key={`${toggleResetKey}-${index}`} index={index} />
            ))}
          </ul>
        </div>
      </form>
    </FormProvider>
  );
};

export default EnvEditor;
