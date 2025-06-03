import { useFormContext } from "react-hook-form";
import { Input } from "../ui/input";
import SecretToggle from "../utils/SecretToggle";

type EnvInputProps = {
  index: number;
};

const EnvInput = ({ index }: EnvInputProps) => {
  const { register } = useFormContext();

  return (
    <div className="flex justify-between gap-x-8">
      <Input
        type="text"
        {...register(`envVariables.${index}.name`)}
        className="w-full"
        autoComplete="off"
        spellCheck="false"
      />
      <SecretToggle name={`envVariables.${index}.value`} />
    </div>
  );
};

export default EnvInput;
