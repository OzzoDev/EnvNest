"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "../ui/input";

type SecretToggleProps = {
  name: string;
};

const SecretToggle = ({ name }: SecretToggleProps) => {
  const { control } = useFormContext();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {isVisible ? (
              <Input {...field} type="text" autoComplete="off" className="pr-10" />
            ) : (
              <Input
                type="text"
                value={"*".repeat(field.value?.length || 0)}
                readOnly
                className="cursor-default"
              />
            )}
          </>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
        onClick={() => setIsVisible((prev) => !prev)}>
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};

export default SecretToggle;
