"use client";

import { Button } from "../ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "../ui/input";

type SecretToggleProps = {
  name: string;
  isVisible: boolean;
  disabled: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

const SecretToggle = ({
  name,
  isVisible,
  disabled,
  setIsVisible,
}: SecretToggleProps) => {
  const { control } = useFormContext();

  return (
    <div className="relative w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {isVisible !== false ? (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled={disabled}
                type="text"
                autoComplete="off"
                className="pr-[55px]"
              />
            ) : (
              <Input
                type="text"
                disabled={disabled}
                value={"*".repeat(field.value?.length || 0)}
                readOnly
                className="cursor-default pr-[55px]"
              />
            )}
          </>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};

export default SecretToggle;
