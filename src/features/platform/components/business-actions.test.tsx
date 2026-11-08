import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import {
  activePlatformBusiness,
  pendingPlatformBusiness,
  superAdminSessionUser,
  suspendedPlatformBusiness,
} from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import type { PlatformBusiness } from "../schemas/platform.schema";
import { approveBusiness, reactivateBusiness, suspendBusiness } from "../services/platform.service";

import { BusinessActions } from "./business-actions";

vi.mock("../services/platform.service", () => ({
  getPlatformOverview: vi.fn(),
  listBusinesses: vi.fn(),
  getBusiness: vi.fn(),
  approveBusiness: vi.fn(),
  suspendBusiness: vi.fn(),
  reactivateBusiness: vi.fn(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: vi.fn(), Toaster: () => null }));

function renderActions(business: PlatformBusiness) {
  return renderWithDesk(<BusinessActions business={business} />, { user: superAdminSessionUser });
}

const buttonNames = () => screen.getAllByRole("button").map((button) => button.textContent);

describe("BusinessActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows each status only the actions it allows", () => {
    const { unmount } = renderActions(pendingPlatformBusiness);
    expect(buttonNames()).toEqual(["Approve business", "Decline registration"]);
    unmount();

    const active = renderActions(activePlatformBusiness);
    expect(buttonNames()).toEqual(["Suspend business"]);
    active.unmount();

    renderActions(suspendedPlatformBusiness);
    expect(buttonNames()).toEqual(["Reactivate business"]);
  });

  it("approves after asking, then confirms with the API's message", async () => {
    vi.mocked(approveBusiness).mockResolvedValue({
      ok: true,
      data: { ...pendingPlatformBusiness, status: "active" },
      message: "Splash Point approved",
    });
    renderActions(pendingPlatformBusiness);
    await userEvent.click(screen.getByRole("button", { name: "Approve business" }));
    const dialog = await screen.findByRole("dialog", { name: "Approve Splash Point?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Approve business" }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith("Splash Point approved"));
    expect(approveBusiness).toHaveBeenCalledWith(pendingPlatformBusiness.id);
  });

  it("needs a reason to decline, and sends it trimmed", async () => {
    vi.mocked(suspendBusiness).mockResolvedValue({
      ok: true,
      data: { ...pendingPlatformBusiness, status: "suspended" },
      message: "Splash Point suspended",
    });
    renderActions(pendingPlatformBusiness);
    await userEvent.click(screen.getByRole("button", { name: "Decline registration" }));
    const dialog = await screen.findByRole("dialog", { name: "Decline Splash Point?" });

    await userEvent.click(within(dialog).getByRole("button", { name: "Decline registration" }));
    expect(
      within(dialog).getAllByText("Give a reason. It stays on the record.").length,
    ).toBeGreaterThan(1);
    expect(suspendBusiness).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByLabelText("Reason"), "  Duplicate registration ");
    await userEvent.click(within(dialog).getByRole("button", { name: "Decline registration" }));
    await waitFor(() =>
      expect(suspendBusiness).toHaveBeenCalledWith(
        pendingPlatformBusiness.id,
        "Duplicate registration",
      ),
    );
  });

  it("shows a refusal inside the dialog, next to the button", async () => {
    vi.mocked(reactivateBusiness).mockResolvedValue({
      ok: false,
      error: {
        kind: "conflict",
        status: 409,
        code: "BUSINESS_STATUS_CONFLICT",
        message: "Only suspended businesses can be reactivated.",
      },
    });
    renderActions(suspendedPlatformBusiness);
    await userEvent.click(screen.getByRole("button", { name: "Reactivate business" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Reactivate business" }));

    expect(
      await within(dialog).findByText("Only suspended businesses can be reactivated."),
    ).toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
  });
});
