import { useProjectStore } from "@/store/projectStore";
import EnvInput from "./EnvInput";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const formSchema = z.object({
  envVariables: z.array(z.object({ name: z.string(), value: z.string() })),
});

type EnvEditorProps = {};

const EnvEditor = () => {
  const secret = useProjectStore((state) => state.secret);
  const formMethods = useForm({
    resolver: zodResolver(formSchema),
  });

  const { reset, getValues } = formMethods;

  useEffect(() => {
    const envVariables = secret?.content.split("&&").map((val) => {
      const [name, value] = val.split("=");
      return { name, value };
    });

    reset({ envVariables: envVariables ?? [] });
  }, [secret]);

  const envVariables = getValues("envVariables");

  return (
    <FormProvider {...formMethods}>
      <div>
        <ul className="flex flex-col gap-y-8">
          {envVariables?.map((envVar, index) => (
            <EnvInput key={envVar.name + index} index={index} />
          ))}
        </ul>
      </div>
    </FormProvider>
  );
};

export default EnvEditor;
