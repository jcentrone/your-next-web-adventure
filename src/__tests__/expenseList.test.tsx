import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/ui/actions-menu", () => ({
  ActionsMenu: () => null,
}));

vi.mock("@/components/ui/select", () => {
  const React = require("react");
  return {
    Select: ({ value, onValueChange, children }: any) => (
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  };
});

import { ExpenseList } from "@/components/expenses/ExpenseList";
import { expenseApi } from "@/integrations/supabase/expenseApi";
import * as mobile from "@/hooks/use-mobile";

const mockExpenses = [
  {
    id: "1",
    amount: 100,
    category: "travel",
    created_at: "2024-01-01",
    description: "Flight to NYC",
    expense_date: "2024-01-01",
    organization_id: "org1",
    receipt_url: null,
    user_id: "u1",
  },
  {
    id: "2",
    amount: 50,
    category: "supplies",
    created_at: "2024-02-01",
    description: "Office supplies",
    expense_date: "2024-02-01",
    organization_id: "org1",
    receipt_url: null,
    user_id: "u1",
  },
];

function setup() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <ExpenseList userId="u1" organizationId="org1" />
    </QueryClientProvider>
  );
}

let mobileSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.restoreAllMocks();
  mobileSpy = vi.spyOn(mobile, "useIsMobile").mockReturnValue(false);
  vi.spyOn(expenseApi, "listExpenses").mockImplementation(async ({
    search,
    category,
    sortBy = "expense_date",
    sortDir = "desc",
  }: any = {}) => {
    let data = [...mockExpenses];
    if (search) {
      const term = search.toLowerCase();
      data = data.filter((e) => e.description?.toLowerCase().includes(term));
    }
    if (category) {
      data = data.filter((e) => e.category === category);
    }
    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "amount") {
        return (a.amount - b.amount) * dir;
      }
      return a.expense_date.localeCompare(b.expense_date) * dir;
    });
    return data;
  });
});

describe("ExpenseList", () => {
  it("filters results by search input", async () => {
    setup();
    await screen.findByText("Flight to NYC");
    const input = screen.getByPlaceholderText(/search expenses/i);
    const user = userEvent.setup();
    await act(async () => {
      await user.type(input, "Flight");
    });
    await new Promise((r) => setTimeout(r, 350));
    await waitFor(() => {
      expect(screen.getByText("Flight to NYC")).toBeInTheDocument();
      expect(screen.queryByText("Office supplies")).not.toBeInTheDocument();
    });
  });

  it("filters results by category selection", async () => {
    setup();
    await screen.findByText("Flight to NYC");
    const select = screen.getByRole("combobox");
    const user = userEvent.setup();
    await act(async () => {
      await user.selectOptions(select, "travel");
    });
    await waitFor(() => {
      expect(screen.getByText("Flight to NYC")).toBeInTheDocument();
      expect(screen.queryByText("Office supplies")).not.toBeInTheDocument();
    });
  });

  it("toggles sort direction when clicking column header", async () => {
    setup();
    await screen.findByText("Flight to NYC");
    const header = screen.getByRole("columnheader", { name: /amount/i });
    const user = userEvent.setup();
    await act(async () => {
      await user.click(header);
    });
    await waitFor(() => {
      expect(expenseApi.listExpenses).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "amount", sortDir: "asc" })
      );
    });
    await act(async () => {
      await user.click(header);
    });
    await waitFor(() => {
      expect(expenseApi.listExpenses).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: "amount", sortDir: "desc" })
      );
    });
  });

  it("renders cards in mobile view", async () => {
    mobileSpy.mockReturnValue(true);
    setup();
    await screen.findByText("Flight to NYC");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

