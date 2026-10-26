"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogActions, DialogContent } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
  /** The API's message when the action failed; shown inside the dialog. */
  error?: string | null;
  /** Extra fields (e.g. a temporary password). */
  children?: ReactNode;
}

/**
 * Asks before a consequential action. The confirm button is secondary with an ink border: the
 * design never colours destructive actions red.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep as is",
  onConfirm,
  pending = false,
  error,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog onOpenChange={(next) => (pending ? undefined : onOpenChange(next))} open={open}>
      <DialogContent description={description} size="sm" title={title}>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {children}
          {error ? (
            <p className="border border-text px-3 py-2.5 text-[13px]" role="alert">
              {error}
            </p>
          ) : null}
          <DialogActions>
            <Button disabled={pending} onClick={() => onOpenChange(false)} variant="ghost">
              {cancelLabel}
            </Button>
            <Button className="border-text" loading={pending} type="submit" variant="secondary">
              {confirmLabel}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
