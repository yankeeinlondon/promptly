import { isError, isKindError } from "@yankeeinlondon/kind-error";
import { isArray, isObject, isString } from "inferred-types";

export function asString(val: unknown) {
  return isError(val)
    ? isKindError(val) ? String(val) : `${val.message}`
    : isObject(val)
      ? JSON.stringify(val)
      : isArray(val)
        ? JSON.stringify(val)
        : isString(val)
          ? val
          : String(val);
}
