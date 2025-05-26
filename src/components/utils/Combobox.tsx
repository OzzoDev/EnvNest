"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

type ComboboxProps<T, L extends keyof T, V extends keyof T, M extends keyof T> = {
  data: T[];
  value: T | null;
  labelKey: L;
  valueKey: V;
  mapKey: M;
  searchMessage: string;
  selectMessage: string;
  emptyMessage: string;
  setValue: (value: T | null) => void;
};

const Combobox = <T, L extends keyof T, V extends keyof T, M extends keyof T>({
  data,
  value,
  labelKey,
  valueKey,
  mapKey,
  searchMessage,
  selectMessage,
  emptyMessage,
  setValue,
}: ComboboxProps<T, L, V, M>) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[260px] justify-between">
          {value
            ? (() => {
                const foundItem = data.find((item) => item[valueKey] === value[valueKey]);
                return foundItem ? (foundItem[labelKey] as string) : selectMessage;
              })()
            : selectMessage}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder={searchMessage} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {data.map((item, index) => (
                <CommandItem
                  key={(item[mapKey] as string) + index}
                  value={item[valueKey] as string}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? null : item);
                    setOpen(false);
                  }}>
                  {item[labelKey] as string}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item[valueKey] ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
