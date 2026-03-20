"use client";

import { Loader2 } from "lucide-react";

interface StrReplaceArgs {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
  new_path?: string;
}

interface FileManagerArgs {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const fileName = (path: string | undefined) => path ? (path.split("/").pop() || path) : "";

  if (toolName === "str_replace_editor") {
    const { command, path } = args as StrReplaceArgs;
    switch (command) {
      case "create":
        return `Creating ${fileName(path)}`;
      case "str_replace":
      case "insert":
        return `Editing ${fileName(path)}`;
      case "view":
        return `Reading ${fileName(path)}`;
      default:
        return `Editing ${fileName(path)}`;
    }
  }

  if (toolName === "file_manager") {
    const { command, path, new_path } = args as FileManagerArgs;
    if (command === "rename" && new_path) {
      return `Renaming ${fileName(path)} → ${fileName(new_path)}`;
    }
    if (command === "delete") {
      return `Deleting ${fileName(path)}`;
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const label = getLabel(toolName, args);
  const isDone = state === "result" && result !== undefined;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

export { getLabel };
