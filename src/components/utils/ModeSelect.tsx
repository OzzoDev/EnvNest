"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { HoverCardContent, HoverCard, HoverCardTrigger } from "../ui/hover-card";
import { v4 as uuidv4 } from "uuid";

type UniqueOptions = {
  value: string;
  uuid: string;
};

type ModeSelectProps = {
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  emptyPlaceHolder?: string;
  selectLabel?: string;
  enableSearch?: boolean;
  isRequired?: boolean;
  options?: string[];
  onSelect: (value: string) => void;
};

const ModeSelect = ({
  selectPlaceholder = "Select",
  searchPlaceholder = "Search...",
  emptyPlaceHolder = "No items found",
  selectLabel = "Options",
  enableSearch = false,
  isRequired = true,
  options = [],
  onSelect,
}: ModeSelectProps) => {
  const uniqueOptions: UniqueOptions[] = useMemo(
    () => options.map((opt) => ({ value: opt, uuid: uuidv4() })),
    [options]
  );
  const [open, setOpen] = useState(false);
  const [openListHoverCard, setOpenListHoverCard] = useState<number>(-1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [filteredUniqueOptions, setFilteredData] = useState<UniqueOptions[]>(uniqueOptions);

  useEffect(() => {
    setFilteredData(uniqueOptions);
    setSelectedValue(null);
  }, [uniqueOptions]);

  const handleSearch = (query: string) => {
    const lower = query.trim().toLowerCase();
    setFilteredData(uniqueOptions.filter((otp) => otp.value.toLowerCase().includes(lower)));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <p
            aria-hidden={!!selectedValue}
            className={cn(
              "text-sm mb-1",
              isRequired ? "text-destructive" : "text-text-color",
              selectedValue ? "invisible" : "visible"
            )}>
            {isRequired ? "Required" : "Optional"}
          </p>
          {selectedValue ? (
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  type="button"
                  aria-expanded={open}
                  className="w-[240px] justify-between">
                  <p className="w-[180px] truncate overflow-hidden whitespace-nowrap text-muted-foreground text-left">
                    {selectedValue
                      ? uniqueOptions.find((otp) => otp.value === selectedValue)?.value
                      : selectPlaceholder}
                  </p>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </HoverCardTrigger>
              {!open && (
                <HoverCardContent className="min-w-[240px] w-full py-2">
                  {selectedValue}
                </HoverCardContent>
              )}
            </HoverCard>
          ) : (
            <Button
              variant="outline"
              role="combobox"
              type="button"
              aria-expanded={open}
              className="w-[240px] justify-between">
              <p className="w-[180px] truncate overflow-hidden whitespace-nowrap text-muted-foreground text-left">
                {selectedValue
                  ? uniqueOptions.find((otp) => otp.value === selectedValue)?.value
                  : selectPlaceholder}
              </p>

              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          {enableSearch ? (
            <CommandInput placeholder={searchPlaceholder} onValueChange={handleSearch} />
          ) : (
            <p className="py-1.5 pl-8 pr-2 text-sm font-semibold">{selectLabel}</p>
          )}
          <CommandList
            onScroll={() => {
              setOpenListHoverCard(-1);
            }}>
            <CommandEmpty>{emptyPlaceHolder}</CommandEmpty>
            <CommandGroup className="pl-1">
              {filteredUniqueOptions.map((otp, index) => (
                <HoverCard
                  key={otp.uuid + otp.value}
                  open={openListHoverCard === index}
                  openDelay={100}
                  closeDelay={0}>
                  <HoverCardTrigger asChild>
                    <CommandItem
                      value={otp.value}
                      onMouseEnter={() => setOpenListHoverCard(index)}
                      onMouseLeave={() => setOpenListHoverCard(-1)}
                      onSelect={(currentValue) => {
                        setSelectedValue(currentValue);
                        onSelect(currentValue);
                        setOpen(false);
                      }}>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedValue === otp.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <p className="w-[200px] truncate overflow-hidden whitespace-nowrap">
                        {otp.value}
                      </p>
                    </CommandItem>
                  </HoverCardTrigger>
                  <HoverCardContent side="bottom" align="start" className="w-full">
                    {otp.value}
                  </HoverCardContent>
                </HoverCard>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ModeSelect;
