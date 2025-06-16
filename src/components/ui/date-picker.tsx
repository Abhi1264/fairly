import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
}

export function DatePicker({ date, onSelect, placeholder = "Pick a date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "pl-2 pr-1"
          )}
        >
          <CalendarIcon className="mr-1.5 h-4 w-4 shrink-0" />
          <span className="truncate">
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onSelect(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
} 