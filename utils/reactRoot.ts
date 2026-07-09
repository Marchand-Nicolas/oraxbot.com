import { createRoot, type Root } from "react-dom/client";
import type { ReactElement } from "react";

const containerToRoot = new Map<HTMLElement, Root>();

export function renderWithRoot(
  element: ReactElement,
  container: HTMLElement | null,
): void {
  if (!container) return;
  let root = containerToRoot.get(container);
  if (!root) {
    root = createRoot(container);
    containerToRoot.set(container, root);
  }
  root.render(element);
}

export function unmountRoot(container: HTMLElement | null): void {
  if (!container) return;
  const root = containerToRoot.get(container);
  if (root) {
    root.unmount();
    containerToRoot.delete(container);
  }
}
