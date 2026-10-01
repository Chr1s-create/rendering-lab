import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TodoForm } from "../app/actions/todo-form";

vi.mock("../app/actions/actions", () => ({
  addTodo: vi.fn(async (prev: { error: string | null; ok: number }) => prev),
}));

describe("TodoForm", () => {
  it("renders the server-provided todo list", () => {
    render(
      <TodoForm
        todos={[
          { id: 1, text: "existing", done: false },
          { id: 2, text: "done item", done: true },
        ]}
      />,
    );
    expect(screen.getByTestId("todo-list")).toHaveTextContent("existing");
    expect(screen.getByTestId("todo-list")).toHaveTextContent("done item");
    expect(screen.getByRole("button", { name: /add \(Server Action\)/i })).toBeEnabled();
  });
});
