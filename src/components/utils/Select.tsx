import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type SelectProps = {
  placeholer: string;
  label: string;
  data: string[];
  onSelect: (value: string) => void;
};

const Select = ({ placeholer, label, data, onSelect }: SelectProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
  };

  return (
    <SelectRoot onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholer} defaultValue={selectedValue ?? ""} />
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
