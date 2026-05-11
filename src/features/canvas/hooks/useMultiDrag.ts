import { useDndContext } from "@dnd-kit/core";

export function useMultiDrag() {
  const ctx = useDndContext();
  return ctx;
}
