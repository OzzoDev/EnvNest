"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { EyeOff, Eye } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "../ui/input";

type PasswordToggleProps = {
  name: string;
};

const PasswordToggle = ({ name }: PasswordToggleProps) => {
  const { register } = useFormContext();
  const [type, setType] = useState<"text" | "password">("password");

  return (
    <div className="relative flex justify-between">
      <Input type={type} {...register(name)} className="" />
      <Button
        type={"button"}
        variant="ghost"
        className="absolute right-0"
        onClick={() => setType((prev) => (prev == "text" ? "password" : "text"))}>
        {type === "text" ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};

export default PasswordToggle;
