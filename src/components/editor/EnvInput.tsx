import { useFormContext } from "react-hook-form";
import { Input } from "../ui/input";
import PasswordToggle from "../utils/PasswordToggle";

type EnvInputProps = {
  index: number;
};

const EnvInput = ({ index }: EnvInputProps) => {
  const { register } = useFormContext();

  return (
    <div className="flex justify-between gap-x-8">
      <div className="w-full">
        <p className="mb-2">Key</p>
        <Input type="text" {...register(`envVariables.${index}.name`)} />
      </div>
      <div className="w-full">
        <p className="mb-2">value</p>
        <PasswordToggle name={`envVariables.${index}.value`} />
      </div>
    </div>
  );
};

export default EnvInput;
