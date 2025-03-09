import { createKindError } from "@yankeeinlondon/kind-error";

export const InputOutput = createKindError(
  "InputOutput",
);

export const ClipboardError = createKindError("ClipboardError");

export const BrowserError = createKindError("BrowserError");
