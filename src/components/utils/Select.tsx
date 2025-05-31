import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { buttonVariants } from "../ui/button";

type SelectProps = {
  placeholder: string;
  label: string;
  data: string[];
  onSelect: (value: string) => void;
};

const Select = ({ placeholder, label, data, onSelect }: SelectProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
  };

  return (
    <SelectRoot onValueChange={handleValueChange}>
      <SelectTrigger className={buttonVariants({ variant: "outline" })}>
        <SelectValue placeholder={placeholder} defaultValue={selectedValue ?? ""} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {data.map((item, index) => (
            <SelectItem key={item + index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
};

export default Select;
