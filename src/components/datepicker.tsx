"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { add, format } from "date-fns";
import { INTERVAL, STORE_CLOSE_TIME, STORE_OPEN_TIME } from "~/constants/config";
import { type Dispatch, type SetStateAction } from "react";

export function DatePicker({ date, setDate }: {
  date: Date | undefined,
  setDate: Dispatch<SetStateAction<Date | undefined>>
}) {

  const getTimes = (): Date[] | undefined => {
    if (!date) {
      return;
    }

    const beginning = add(date.getDate(), { hours: STORE_OPEN_TIME - 1 });
    const end = add(date.getDate(), { hours: STORE_CLOSE_TIME - 1 });

    const times = [];

    for (
      let idx = beginning;
      idx <= end;
      idx = add(idx, { minutes: INTERVAL })
    ) {
      times.push(idx);
    }

    return times;
  };

  const times = getTimes();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"default"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {!date ? (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        ) : (
          <div className="flex gap-1">
            {times?.map((time, idx) => {
              return (
                <div className="border-2 border-black" key={`time-${idx}`}>
                  <button
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setHours(time.getHours(), time.getMinutes());

                      console.log(newDate);
                      setDate(newDate);
                    }}
                  >
                    {format(time, "kk:mm")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
