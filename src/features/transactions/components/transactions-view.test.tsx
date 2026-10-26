import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { transactionList } from "@/testing/fixtures";
import { renderWithDesk } from "@/testing/render";

import { listTransactions } from "../services/transactions.service";
import { DEFAULT_TRANSACTION_FILTERS } from "../utils/transaction-filters";

import { TransactionsView } from "./transactions-view";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/transactions",
}));
vi.mock("../services/transactions.service", () => ({
  listTransactions: vi.fn(),
  getTransaction: vi.fn(),
  cancelTransaction: vi.fn(),
  createTransaction: vi.fn(),
}));
vi.mock("@/features/settings/services/settings.service", () => ({ getBusinessSettings: vi.fn() }));

describe("TransactionsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/transactions");
    vi.mocked(listTransactions).mockResolvedValue({
      ok: true,
      data: transactionList,
      message: "OK",
    });
  });
  afterEach(() => vi.useRealTimers());

  it("shows the summary line and every row", async () => {
    renderWithDesk(<TransactionsView initialFilters={DEFAULT_TRANSACTION_FILTERS} />);
    expect(await screen.findByText("3 transactions · ₦11,500 paid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open receipt CW-261019-026" })).toBeInTheDocument();
    expect(listTransactions).toHaveBeenCalledWith({ range: "today", page: 1, limit: 40 });
  });

  it("writes filter changes back to the URL and refetches", async () => {
    const user = userEvent.setup();
    renderWithDesk(<TransactionsView initialFilters={DEFAULT_TRANSACTION_FILTERS} />);
    await screen.findByText("3 transactions · ₦11,500 paid");

    await user.click(screen.getByRole("radio", { name: "7 days" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Payment method" }), "cash");
    await waitFor(() =>
      expect(replace).toHaveBeenLastCalledWith("/transactions?range=7d&method=cash", {
        scroll: false,
      }),
    );
    await waitFor(() =>
      expect(listTransactions).toHaveBeenLastCalledWith({
        range: "7d",
        method: "cash",
        page: 1,
        limit: 40,
      }),
    );
    expect(screen.getByRole("link", { name: "Export CSV" })).toHaveAttribute(
      "href",
      "/api/export/transactions?range=7d&method=cash",
    );
  });

  it("debounces the search by 300 ms before it reaches the URL", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithDesk(<TransactionsView initialFilters={DEFAULT_TRANSACTION_FILTERS} />);
    await screen.findByText("3 transactions · ₦11,500 paid");

    await user.type(screen.getByRole("searchbox", { name: "Search transactions" }), "KJA");
    expect(replace).not.toHaveBeenCalledWith("/transactions?q=KJA", { scroll: false });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/transactions?q=KJA", { scroll: false }),
    );
  });

  it("reads its starting filters from the URL and says when nothing matches", async () => {
    vi.mocked(listTransactions).mockResolvedValue({
      ok: true,
      data: {
        ...transactionList,
        items: [],
        pageInfo: { ...transactionList.pageInfo, total: 0, totalPages: 0 },
        summary: { count: 0, paidCount: 0, paidTotalKobo: 0 },
      },
      message: "OK",
    });
    window.history.replaceState(null, "", "/transactions?status=cancelled");
    renderWithDesk(
      <TransactionsView initialFilters={{ ...DEFAULT_TRANSACTION_FILTERS, status: "cancelled" }} />,
    );
    expect(await screen.findByText("No transactions match these filters.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("cancelled");
    expect(replace).not.toHaveBeenCalled();
  });
});
