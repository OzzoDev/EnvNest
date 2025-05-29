import { FormEvent, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type EnvEditorProps = {
  defaultValue: string;
  onSave: (value: string) => void;
};

const EnvEditor = ({ defaultValue, onSave }: EnvEditorProps) => {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-8 w-full h-full">
      <div className="flex justify-between">
        <p className="text-lg text-text-color">Edit .env file</p>
        <Button type="submit" variant="outline">
          Save
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-full resize-none"
      />
    </form>
  );
};

export default EnvEditor;
