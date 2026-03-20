import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel unit tests ---

test("getLabel: str_replace_editor create shows Creating + filename", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
});

test("getLabel: str_replace_editor create uses last path segment", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "/src/components/Card.tsx" })).toBe("Creating Card.tsx");
});

test("getLabel: str_replace_editor str_replace shows Editing", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "/Card.jsx" })).toBe("Editing Card.jsx");
});

test("getLabel: str_replace_editor insert shows Editing", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "/index.tsx" })).toBe("Editing index.tsx");
});

test("getLabel: str_replace_editor view shows Reading", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading App.jsx");
});

test("getLabel: file_manager delete shows Deleting", () => {
  expect(getLabel("file_manager", { command: "delete", path: "/old.jsx" })).toBe("Deleting old.jsx");
});

test("getLabel: file_manager rename shows Renaming with arrow", () => {
  expect(getLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })).toBe("Renaming old.jsx → new.jsx");
});

test("getLabel: unknown tool falls back to tool name", () => {
  expect(getLabel("some_unknown_tool", {})).toBe("some_unknown_tool");
});

// --- ToolCallBadge render tests ---

test("ToolCallBadge shows 'Creating' label for str_replace_editor create", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows 'Editing' label for str_replace_editor str_replace", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Card.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "ok",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge shows spinner when loading", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
        result: undefined,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge shows 'Deleting' for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "5",
        toolName: "file_manager",
        args: { command: "delete", path: "/old-component.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleting old-component.jsx")).toBeDefined();
});

test("ToolCallBadge shows rename label with arrow for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "6",
        toolName: "file_manager",
        args: { command: "rename", path: "/Button.jsx", new_path: "/components/Button.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renaming Button.jsx → Button.jsx")).toBeDefined();
});
