import { useFormContext } from "react-hook-form";
import { Input } from "../ui/input";
import SecretToggle from "../utils/SecretToggle";
import { IoMdClose } from "react-icons/io";
import AlertDialog from "../utils/AleartDialog";
import { Button } from "../ui/button";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

type EnvInputProps = {
  index: number;
  onDelete: (index: number) => void;
};

const EnvInput = ({ index, onDelete }: EnvInputProps) => {
  const isSaved = useProjectStore((state) => state.isSaved);
  const { register, getValues, setValue } = useFormContext();

  const name = getValues("envVariables")[index].name;

  return (
    <div className="flex justify-between gap-x-8">
      <div className="flex  gap-x-2 w-full">
        {isSaved ? (
          <AlertDialog
            title="Delete env variable"
            description={`Are you sure you want to delete ${name}?`}
            action="Delete"
            actionFn={() => onDelete(index)}>
            <Button variant="ghost">
              <IoMdClose size={16} />
            </Button>
          </AlertDialog>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => toast.error("Please save your changes")}>
            <IoMdClose size={16} />
          </Button>
        )}

        <Input
          type="text"
          {...register(`envVariables.${index}.name`)}
          className="w-full"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <SecretToggle name={`envVariables.${index}.value`} />
    </div>
  );
};

export default EnvInput;
