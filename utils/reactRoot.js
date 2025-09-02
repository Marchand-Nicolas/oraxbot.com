import { createRoot } from "react-dom/client";

const containerToRoot = new Map();

export function renderWithRoot(element, container) {
  if (!container) return;
  let root = containerToRoot.get(container);
  if (!root) {
    root = createRoot(container);
    containerToRoot.set(container, root);
  }
  root.render(element);
}

export function unmountRoot(container) {
  const root = containerToRoot.get(container);
  if (root) {
    root.unmount();
    containerToRoot.delete(container);
  }
}
