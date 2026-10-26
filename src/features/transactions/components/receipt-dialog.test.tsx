import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import type { User } from "@/features/auth/schemas/auth.schema";
import { getBusinessSettings } from "@/features/settings/services/settings.service";
import {
  adjustedTransaction,
  adminUser,
  businessSettings,
  cancelledTransaction,
  cashierUser,
  paidTransaction,
} from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import type { Transaction } from "../schemas/transaction.schema";
import { cancelTransaction, getTransaction } from "../services/transactions.service";

import { ReceiptDialog } from "./receipt-dialog";

vi.mock("@/features/settings/services/settings.service", () => ({ getBusinessSettings: vi.fn() }));
vi.mock("../services/transactions.service", () => ({
  createTransaction: vi.fn(),
  getTransaction: vi.fn(),
  cancelTransaction: vi.fn(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: vi.fn(), Toaster: () => null }));

function open(transaction: Transaction, user: User = adminUser) {
  vi.mocked(getBusinessSettings).mockResolvedValue({
    ok: true,
    data: businessSettings,
    message: "OK",
  });
  vi.mocked(getTransaction).mockResolvedValue({ ok: true, data: transaction, message: "OK" });
  const onClose = vi.fn();
  renderWithDesk(<ReceiptDialog onClose={onClose} transaction={transaction} />, { user });
  return {
    dialog: screen.getByRole("dialog", { name: `Receipt ${transaction.reference}` }),
    onClose,
  };
}

describe("ReceiptDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("prints the receipt lines from the transaction and business details", async () => {
    const { dialog } = open(adjustedTransaction);
    expect(
      await within(dialog).findByText("14 Admiralty Way, Lekki Phase 1, Lagos"),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("19 Oct 2026, 10:30 AM")).toBeInTheDocument();
    expect(within(dialog).getByText("Adjusted · Regular customer discount")).toBeInTheDocument();
    expect(within(dialog).getByText("−₦500")).toBeInTheDocument();
    expect(within(dialog).getByText("Toyota Corolla · KJA 482 FX")).toBeInTheDocument();
    expect(within(dialog).getByText("₦5,500")).toBeInTheDocument();
    expect(within(dialog).getByText("Clean car. Clear impression.")).toBeInTheDocument();
  });

  it("gives cashiers no cancel button, only the note", () => {
    const { dialog } = open(paidTransaction, cashierUser);
    expect(
      within(dialog).queryByRole("button", { name: "Cancel transaction" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByText("Need to cancel? Ask an admin.")).toBeInTheDocument();
  });

  it("lets an admin cancel with a required reason", async () => {
    const cancelled: Transaction = {
      ...paidTransaction,
      status: "cancelled",
      cancellation: {
        by: { id: adminUser.id, name: adminUser.name },
        reason: "Duplicate entry",
        at: "2026-10-19T10:00:00.000Z",
      },
    };
    const user = userEvent.setup();
    const { dialog } = open(paidTransaction, adminUser);
    vi.mocked(cancelTransaction).mockImplementation(async () => {
      // From now on the API holds the cancelled record.
      vi.mocked(getTransaction).mockResolvedValue({ ok: true, data: cancelled, message: "OK" });
      return {
        ok: true,
        data: cancelled,
        message: "CW-261019-024 cancelled · removed from revenue",
      };
    });
    expect(within(dialog).queryByText("Need to cancel? Ask an admin.")).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel transaction" }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel transaction" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "A reason is required. It stays on the record.",
    );
    expect(cancelTransaction).not.toHaveBeenCalled();

    await user.type(
      within(dialog).getByLabelText("Why is this transaction being cancelled?"),
      "Duplicate entry",
    );
    await user.click(within(dialog).getByRole("button", { name: "Cancel transaction" }));

    await waitFor(() =>
      expect(cancelTransaction).toHaveBeenCalledWith(paidTransaction.id, "Duplicate entry"),
    );
    expect(toast).toHaveBeenCalledWith("CW-261019-024 cancelled · removed from revenue");
    expect(
      await within(dialog).findByText(
        "Cancelled by Adaeze Okafor · Duplicate entry. Not counted in revenue.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the API's message when a cancel is refused", async () => {
    vi.mocked(cancelTransaction).mockResolvedValue({
      ok: false,
      error: {
        kind: "conflict",
        status: 409,
        code: "TRANSACTION_ALREADY_CANCELLED",
        message: "This transaction is already cancelled.",
      },
    });
    const user = userEvent.setup();
    const { dialog } = open(paidTransaction, adminUser);
    await user.click(within(dialog).getByRole("button", { name: "Cancel transaction" }));
    await user.type(
      within(dialog).getByLabelText("Why is this transaction being cancelled?"),
      "Duplicate entry",
    );
    await user.click(within(dialog).getByRole("button", { name: "Cancel transaction" }));
    expect(
      await within(dialog).findByText("This transaction is already cancelled."),
    ).toBeInTheDocument();
  });

  it("strikes a cancelled total and offers no cancel", () => {
    const { dialog } = open(cancelledTransaction, adminUser);
    expect(within(dialog).getByText("₦6,000", { selector: ".line-through" })).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Cancel transaction" }),
    ).not.toBeInTheDocument();
  });

  it("copies the receipt text and closes on Done", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const { dialog, onClose } = open(paidTransaction, cashierUser);
    await within(dialog).findByText("0803 412 7790");
    await user.click(within(dialog).getByRole("button", { name: "Copy text" }));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("CW-261019-024 · 19 Oct 2026, 10:30 AM"),
    );
    expect(toast).toHaveBeenCalledWith("Receipt text copied");
    await user.click(within(dialog).getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
  });
});
