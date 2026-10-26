import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Props a Field hands its control so the label, hint and error are wired up. */
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

interface FieldProps {
  label: ReactNode;
  /** Help under the control, always visible. */
  hint?: ReactNode;
  /** Error copy; marks the control invalid and is announced. */
  error?: string;
  optional?: boolean;
  /** A fixed id; otherwise one is generated. */
  id?: string;
  className?: string;
  /** Render the control with the given props: `{(props) => <Input {...props} />}`. */
  children: (props: FieldControlProps) => ReactNode;
}

/**
 * A labelled control with hint and inline error (Industry `.field`).
 *
 * @example
 * <Field label="Plate number" error={errors.plate}>
 *   {(props) => <Input inputSize="lg" {...props} />}
 * </Field>
 */
export function Field({ label, hint, error, optional, id, className, children }: FieldProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <label className="mb-[5px] block text-[12px] text-neutral-700" htmlFor={controlId}>
        {label}
        {optional ? <span className="ml-1.5 text-neutral-600">Optional</span> : null}
      </label>
      {children({
        id: controlId,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error ? { "aria-invalid": true as const } : {}),
      })}
      {hint ? (
        <p className="mt-1 text-[12px] text-neutral-700" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-[13px] text-text" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
