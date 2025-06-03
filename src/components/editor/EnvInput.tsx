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
      <Input type="text" {...register(`envVariables.${index}.name`)} className="w-full" />
      <PasswordToggle name={`envVariables.${index}.value`} />
    </div>
  );
};

export default EnvInput;
