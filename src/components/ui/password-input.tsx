"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Input, type InputProps } from "./input";

/**
 * A password input with a show/hide toggle. The toggle is a button, never a submit, and keeps
 * focus in the field so a tablet keyboard does not close on every tap.
 */
export function PasswordInput({ className, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} className={cn("pr-11", className)} type={visible ? "text" : "password"} />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-neutral-700 transition-colors hover:text-text focus-visible:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        onClick={() => setVisible((current) => !current)}
        onMouseDown={(event) => event.preventDefault()}
        type="button"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />
        ) : (
          <Eye aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
