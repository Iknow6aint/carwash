import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  activePlatformBusiness,
  platformBusinessPage,
  superAdminSessionUser,
} from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import { listBusinesses } from "../services/platform.service";
import { DEFAULT_BUSINESS_FILTERS } from "../utils/business-filters";

import { BusinessesView } from "./businesses-view";

const replace = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => "/platform",
}));
vi.mock("../services/platform.service", () => ({
  getPlatformOverview: vi.fn(),
  listBusinesses: vi.fn(),
  getBusiness: vi.fn(),
  approveBusiness: vi.fn(),
  suspendBusiness: vi.fn(),
  reactivateBusiness: vi.fn(),
}));

const empty = { items: [], pageInfo: { page: 1, limit: 40, total: 0, totalPages: 0 } };

describe("BusinessesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listBusinesses).mockResolvedValue({
      ok: true,
      data: platformBusinessPage,
      message: "Businesses",
    });
  });

  it("lists businesses with owner, status and 30-day revenue, linking to each one", async () => {
    renderWithDesk(<BusinessesView initialFilters={DEFAULT_BUSINESS_FILTERS} />, {
      user: superAdminSessionUser,
    });
    const link = await screen.findByRole("link", { name: "Cartory Wash" });
    expect(link).toHaveAttribute("href", `/platform/businesses/${activePlatformBusiness.id}`);
    const row = link.closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row as HTMLElement);
    expect(cells.getByText("adaeze@cartorywash.ng")).toBeInTheDocument();
    expect(cells.getByText("Active")).toBeInTheDocument();
    expect(cells.getByText("₦2,415,000")).toBeInTheDocument();
    expect(screen.getByText("3 businesses")).toBeInTheDocument();
  });

  it("asks the API for the status from the URL and writes a new choice back", async () => {
    renderWithDesk(<BusinessesView initialFilters={{ q: "", status: "pending" }} />, {
      user: superAdminSessionUser,
    });
    await screen.findByRole("link", { name: "Splash Point" });
    expect(listBusinesses).toHaveBeenCalledWith({ status: "pending", page: 1, limit: 40 });

    await userEvent.click(screen.getByRole("radio", { name: "Suspended" }));
    expect(replace).toHaveBeenLastCalledWith("/platform?status=suspended", { scroll: false });
  });

  it("tells an empty platform apart from filters that match nothing", async () => {
    vi.mocked(listBusinesses).mockResolvedValue({ ok: true, data: empty, message: "Businesses" });
    const { unmount } = renderWithDesk(
      <BusinessesView initialFilters={DEFAULT_BUSINESS_FILTERS} />,
      { user: superAdminSessionUser },
    );
    expect(await screen.findByText("No businesses yet.")).toBeInTheDocument();
    unmount();

    renderWithDesk(<BusinessesView initialFilters={{ q: "nowhere", status: "all" }} />, {
      user: superAdminSessionUser,
    });
    expect(await screen.findByText("No businesses match these filters.")).toBeInTheDocument();
  });
});
