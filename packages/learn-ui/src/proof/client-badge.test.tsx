import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClientBadge } from "./client-badge";

describe("ClientBadge", () => {
  it("hydrates and shows the label", async () => {
    render(<ClientBadge label="counter" />);
    await waitFor(() => {
      expect(screen.getByText(/hydrated/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/counter/)).toBeInTheDocument();
    expect(screen.getByTestId ? document.querySelector('[data-hydrated="yes"]') : null).toBeTruthy();
  });
});
