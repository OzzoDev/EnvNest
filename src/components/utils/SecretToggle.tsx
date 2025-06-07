"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Input } from "../ui/input";

type SecretToggleProps = {
  name: string;
};

const SecretToggle = ({ name }: SecretToggleProps) => {
  const {
    control,
    getValues,
    formState: { isDirty },
  } = useFormContext();
  const value = getValues(name);
  const [isVisible, setIsVisible] = useState(!value);

  console.log(getValues());

  const watchedValues = useWatch({ control: control });

  useEffect(() => {
    setIsVisible(!value);
  }, [watchedValues]);

  useEffect(() => {
    if (!isDirty) {
      setIsVisible(false);
    }
  }, [isDirty]);

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
        className="absolute right-0 top-1/2 transform -translate-y-1/2"
        onClick={() => setIsVisible((prev) => !prev)}>
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};

export default SecretToggle;
