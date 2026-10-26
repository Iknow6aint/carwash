import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { adminUser, cashierUser, exteriorWash, fullWash } from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import { createService, listServices, updateService } from "../services/services.service";

import { ServicesView } from "./services-view";

vi.mock("../services/services.service", () => ({
  listServices: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
}));
vi.mock("@/components/ui/toast", () => ({ toast: vi.fn(), Toaster: () => null }));

const inactive = {
  ...exteriorWash,
  id: "64b7f0c2a1b2c3d4e5f60199",
  name: "Upholstery shampoo",
  isActive: false,
};

describe("ServicesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listServices).mockResolvedValue({
      ok: true,
      data: [exteriorWash, fullWash, inactive],
      message: "OK",
    });
  });

  it("shows cashiers the prices read-only with the admin notice", async () => {
    renderWithDesk(<ServicesView />, { user: cashierUser });
    expect(await screen.findByText("Full wash")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Prices are set by an admin. You can still adjust a price on a single transaction and give a reason.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add service" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Edit/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Deactivate/ })).not.toBeInTheDocument();
  });

  it("lets an admin add a service in whole naira (sent as kobo)", async () => {
    vi.mocked(createService).mockResolvedValue({
      ok: true,
      data: { ...fullWash, name: "Tyre shine", priceKobo: 200_000 },
      message: "Tyre shine added",
    });
    const user = userEvent.setup();
    renderWithDesk(<ServicesView />, { user: adminUser });
    await screen.findByText("Full wash");

    await user.click(screen.getByRole("button", { name: "Add service" }));
    expect(screen.getByText("Give the service a name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a price in naira.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("New service"), "Tyre shine");
    await user.type(screen.getByLabelText("Price (₦)"), "2,000");
    await user.click(screen.getByRole("button", { name: "Add service" }));
    await waitFor(() =>
      expect(createService).toHaveBeenCalledWith({ name: "Tyre shine", priceKobo: 200_000 }),
    );
    expect(toast).toHaveBeenCalledWith("Tyre shine added");
  });

  it("edits a price inline and sends only what changed", async () => {
    vi.mocked(updateService).mockResolvedValue({
      ok: true,
      data: { ...fullWash, priceKobo: 650_000 },
      message: "Price saved · applies to new transactions",
    });
    const user = userEvent.setup();
    renderWithDesk(<ServicesView />, { user: adminUser });
    await user.click(await screen.findByRole("button", { name: "Edit Full wash" }));
    const price = screen.getByLabelText("Price in naira");
    await user.clear(price);
    await user.type(price, "6500");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(updateService).toHaveBeenCalledWith(fullWash.id, { priceKobo: 650_000 }),
    );
    expect(toast).toHaveBeenCalledWith("Price saved · applies to new transactions");
  });

  it("dims inactive services and offers Activate", async () => {
    renderWithDesk(<ServicesView />, { user: adminUser });
    const row = (await screen.findByText("Upholstery shampoo")).closest("tr");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText("Inactive")).toBeInTheDocument();
    expect(
      within(row as HTMLElement).getByRole("button", { name: "Activate Upholstery shampoo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Upholstery shampoo")).toHaveClass("opacity-55");
  });
});
