import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { listServices } from "@/features/services/services/services.service";
import type { BusinessSettings } from "@/features/settings/schemas/settings.schema";
import { getBusinessSettings } from "@/features/settings/services/settings.service";
import {
  businessSettings,
  exteriorWash,
  FULL_WASH_ID,
  fullWash,
  paidTransaction,
} from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import { createTransaction } from "../services/transactions.service";

import { NewTransactionForm } from "./new-transaction-form";

vi.mock("@/features/services/services/services.service", () => ({ listServices: vi.fn() }));
vi.mock("@/features/settings/services/settings.service", () => ({ getBusinessSettings: vi.fn() }));
vi.mock("../services/transactions.service", () => ({
  createTransaction: vi.fn(),
  getTransaction: vi.fn(),
  cancelTransaction: vi.fn(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: vi.fn(), Toaster: () => null }));

const saved = {
  ok: true as const,
  data: paidTransaction,
  message: `Saved ${paidTransaction.reference}`,
};

function setup(settings: BusinessSettings = businessSettings) {
  vi.mocked(listServices).mockResolvedValue({
    ok: true,
    data: [exteriorWash, fullWash],
    message: "OK",
  });
  vi.mocked(getBusinessSettings).mockResolvedValue({ ok: true, data: settings, message: "OK" });
  const user = userEvent.setup();
  renderWithDesk(<NewTransactionForm />);
  return {
    user,
    save: () => user.click(screen.getByRole("button", { name: "Save & show receipt" })),
    pickService: async (name: string) =>
      user.click(await screen.findByRole("button", { name: new RegExp(`^${name}`) })),
    pickMethod: (name: string) => user.click(screen.getByRole("button", { name })),
    errors: () => screen.queryByRole("alert"),
  };
}

describe("NewTransactionForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists what is missing with the prototype's copy", async () => {
    const { save, errors } = setup();
    await screen.findByRole("button", { name: /^Full wash/ });
    await save();
    expect(errors()).toHaveTextContent("Choose a service.");
    expect(errors()).toHaveTextContent("Choose how the customer paid.");
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it("records a sale in three taps and opens the receipt", async () => {
    vi.mocked(createTransaction).mockResolvedValue({
      ...saved,
      data: { ...paidTransaction, method: "cash" },
    });
    const { pickService, pickMethod, save, user } = setup();

    await pickService("Full wash");
    expect(screen.getByRole("button", { name: /^Full wash/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.type(screen.getByLabelText("Plate number"), "kja  482 fx");
    await pickMethod("Cash");
    await save();

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0]).toEqual({
      serviceId: FULL_WASH_ID,
      method: "cash",
      plate: "KJA 482 FX",
      makeModel: null,
      paymentConfirmed: false,
    });
    expect(toast).toHaveBeenCalledWith("Saved CW-261019-024 · dashboard updated");
    const receipt = await screen.findByRole("dialog", { name: "Receipt CW-261019-024" });
    expect(within(receipt).getByText("Cartory Wash")).toBeInTheDocument();
    // The form is reset for the next car (behind the modal receipt, so hidden from the a11y tree).
    expect(screen.getByRole("button", { name: /^Full wash/, hidden: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("adjusts the price with a reason and shows the difference", async () => {
    vi.mocked(createTransaction).mockResolvedValue(saved);
    const { pickService, pickMethod, save, errors, user } = setup();

    await pickService("Full wash");
    await pickMethod("Cash");
    expect(screen.queryByLabelText("Amount charged (₦)")).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Adjust price" }));
    await save();
    expect(errors()).toHaveTextContent("Enter the amount charged.");
    expect(errors()).toHaveTextContent("Give a reason for the price change.");

    await user.type(screen.getByLabelText("Amount charged (₦)"), "5500");
    const summary = screen.getByRole("complementary", { name: "Summary" });
    expect(within(summary).getByRole("status")).toHaveTextContent("₦5,500");
    expect(screen.getByText("₦500 below list price")).toBeInTheDocument();
    await user.type(
      screen.getByLabelText("Reason (saved with the transaction)"),
      "Regular customer discount",
    );
    await save();

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0]).toMatchObject({
      amountKobo: 550_000,
      adjustmentReason: "Regular customer discount",
    });
  });

  it("shows the confirmation tick only for transfer and POS, with the exact copy", async () => {
    const { pickService, pickMethod, save, errors, user } = setup();
    await pickService("Exterior wash");

    await pickMethod("Cash");
    expect(
      screen.queryByRole("checkbox", { name: /transfer has arrived|approved slip/ }),
    ).not.toBeInTheDocument();

    await pickMethod("Bank transfer");
    expect(
      screen.getByRole("checkbox", {
        name: "I checked the bank app and this transfer has arrived.",
      }),
    ).toBeInTheDocument();

    await pickMethod("POS");
    const tick = screen.getByRole("checkbox", {
      name: "The POS terminal printed an approved slip for this amount.",
    });
    await save();
    expect(errors()).toHaveTextContent("Confirm the POS slip shows approved.");

    vi.mocked(createTransaction).mockResolvedValue(saved);
    await user.click(tick);
    await save();
    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0]).toMatchObject({
      method: "pos",
      paymentConfirmed: true,
    });
  });

  it("skips the tick when the business turned confirmation off", async () => {
    const { pickService, pickMethod } = setup({
      ...businessSettings,
      requirePaymentConfirmation: false,
    });
    await pickService("Exterior wash");
    await waitFor(() => expect(getBusinessSettings).toHaveBeenCalled());
    await pickMethod("Bank transfer");
    await waitFor(() =>
      expect(
        screen.queryByRole("checkbox", { name: /transfer has arrived/ }),
      ).not.toBeInTheDocument(),
    );
  });

  it("reuses the idempotency key when retrying the same sale, and starts a new one after saving", async () => {
    vi.mocked(createTransaction)
      .mockResolvedValueOnce({
        ok: false,
        error: { kind: "network", message: "Couldn't reach the Payment Desk server.", status: 0 },
      })
      .mockResolvedValue(saved);
    const { pickService, pickMethod, save, errors, user } = setup();

    await pickService("Full wash");
    await pickMethod("Cash");
    await save();
    await waitFor(() =>
      expect(errors()).toHaveTextContent("Try again; the sale won't be saved twice."),
    );
    await save();
    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(2));

    const [firstKey, retryKey] = vi.mocked(createTransaction).mock.calls.map((call) => call[1]);
    expect(firstKey).toBeTruthy();
    expect(retryKey).toBe(firstKey);

    await user.click(await screen.findByRole("button", { name: "Done" }));
    await pickService("Exterior wash");
    await pickMethod("Cash");
    await save();
    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(3));
    expect(vi.mocked(createTransaction).mock.calls[2]?.[1]).not.toBe(firstKey);
  });

  it("shows the API's message mapped to the prototype's copy", async () => {
    vi.mocked(createTransaction).mockResolvedValue({
      ok: false,
      error: {
        kind: "validation",
        status: 400,
        code: "PAYMENT_NOT_CONFIRMED",
        message: "Confirm the transfer has arrived. / Confirm the POS slip shows approved.",
      },
    });
    const { pickService, pickMethod, save, errors, user } = setup();
    await pickService("Full wash");
    await pickMethod("Bank transfer");
    await user.click(screen.getByRole("checkbox", { name: /transfer has arrived/ }));
    await save();
    await waitFor(() => expect(errors()).toHaveTextContent(/^Confirm the transfer has arrived\.$/));
  });
});
