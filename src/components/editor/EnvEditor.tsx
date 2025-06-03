import { useProjectStore } from "@/store/projectStore";
import EnvInput from "./EnvInput";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useEffect, useState } from "react";
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

const formSchema = z.object({
  envVariables: z.array(z.object({ name: z.string(), value: z.string() })),
});

const EnvEditor = () => {
  const secret = useProjectStore((state) => state.secret);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);

  const [open, setOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");

  const formMethods = useForm({
    resolver: zodResolver(formSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isDirty },
  } = formMethods;

  useEffect(() => {
    setIsSaved(!isDirty);
  }, [isDirty]);

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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Data: ", data, "Update message: ", updateMessage);
  };

  return (
    <FormProvider {...formMethods}>
      <form>
        <div className="flex flex-col gap-y-8">
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
                    setOpen(false); // <-- close dialog programmatically after save
                  })}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <ul className="flex flex-col gap-y-8">
            {envVariables?.map((_, index) => (
              <EnvInput key={index} index={index} />
            ))}
          </ul>
        </div>
      </form>
    </FormProvider>
  );
};

export default EnvEditor;
