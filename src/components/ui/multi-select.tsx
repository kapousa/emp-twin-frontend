"use client";

import { MultiSelect } from "@ark-ui/react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import React from "react";

const DocumentMultiSelect = ({ options, value, onChange, placeholder, className, ...props }) => {
  return (
    <MultiSelect.Root
      className={className}
      value={value}
      onChange={(e) => onChange(e.value)}
      multiple
      {...props}
    >
      <MultiSelect.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
        <MultiSelect.ValueText />
        <div className="flex items-center gap-1">
          <MultiSelect.ClearTrigger className="p-1">
            <XIcon className="h-4 w-4 text-muted-foreground" />
          </MultiSelect.ClearTrigger>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </div>
      </MultiSelect.Trigger>
      <MultiSelect.Content className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        {options.map((option) => (
          <MultiSelect.Option
            key={option.value}
            value={option.value}
            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <MultiSelect.OptionIndicator>
                <ChevronDownIcon className="h-4 w-4" />
              </MultiSelect.OptionIndicator>
            </span>
            <MultiSelect.OptionText>{option.label}</MultiSelect.OptionText>
          </MultiSelect.Option>
        ))}
      </MultiSelect.Content>
    </MultiSelect.Root>
  );
};

export { DocumentMultiSelect };