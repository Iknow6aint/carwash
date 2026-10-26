import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { can, DESK_ACTIONS, type DeskAction } from "@/lib/auth/access";
import { adminUser, cashierUser } from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import { Can } from "./can";

describe("<Can>", () => {
  it("hides admin actions from a cashier and shows the fallback instead", () => {
    renderWithDesk(
      <Can action="transactions:cancel" fallback={<p>Need to cancel? Ask an admin.</p>}>
        <button type="button">Cancel transaction</button>
      </Can>,
      { user: cashierUser },
    );
    expect(screen.queryByRole("button", { name: "Cancel transaction" })).not.toBeInTheDocument();
    expect(screen.getByText("Need to cancel? Ask an admin.")).toBeInTheDocument();
  });

  it("shows admin actions to an admin", () => {
    renderWithDesk(
      <Can action="services:manage">
        <button type="button">Add service</button>
      </Can>,
      { user: adminUser },
    );
    expect(screen.getByRole("button", { name: "Add service" })).toBeInTheDocument();
  });
});

describe("can()", () => {
  it("gives every gated action to admins only (PROJECT_GUIDE §2)", () => {
    for (const action of Object.keys(DESK_ACTIONS) as DeskAction[]) {
      expect(can("admin", action)).toBe(true);
      expect(can("cashier", action)).toBe(false);
    }
  });
});
