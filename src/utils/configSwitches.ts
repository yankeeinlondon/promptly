import type { AlphaChar, ExpandDictionary, FromDefn } from "inferred-types";
import { createKindError } from "@yankeeinlondon/kind-error";
import { ensureLeading, isArray, isString, stripLeading } from "inferred-types";

export type CliSwitch = "string"
    | "number"
    | "boolean"
    | [short: string, "string" | "number" | "boolean"];

type NoShort<T extends Record<string, CliSwitch>> = {
  [K in keyof T]: T[K] extends [string, infer Type extends CliSwitch]
    ? Type
    : T[K];
};

type Switch = `-${string}`;
type SwitchKey = `${AlphaChar}${string}`;

const NoSwitchDefn = createKindError(
  "NoSwitchDefn",
);

/**
 * Allows the runtime to specify the switch configuration types
 * which are expected.
 */
export function configSwitches<
  T extends Record<K, CliSwitch>,
  K extends SwitchKey,
>(
  input: string[],
  defn: T,
) {
  // strip off CLI name and runner
  input = input.slice(2);
  const args: string[] = [];
  const switches = {
    unknown: [] as string[],
  } as Record<"unknown", any>;

  const shortLookup: Record<Switch, string> = Object.entries(defn)
    .reduce(
      (acc, [key, val]) => {
        if (isArray(val) && isString(val[0])) {
          return { ...acc, [ensureLeading(val[0], "-")]: ensureLeading(key, "--") };
        }
        else {
          return acc;
        }
      },
      {},
    );

  const switchValues = [
    // long swiches
    ...Object.keys(defn).map(i => ensureLeading(i, "--")),
    // short swiches
    ...Object.values(defn)
      .filter(
        i => isArray(i),
      )
      .map(
        i => ensureLeading((i as [string, string])[0], "-"),
      ),
  ];

  function isSwitch(val: string): val is Switch {
    return val.startsWith("-");
  }
  function isKnownSwitch(val: string): val is Switch {
    return switchValues.some(i => val.startsWith(i));
  }
  function isShortSwitch(val: string) {
    return val.startsWith("-") && !val.startsWith("--");
  }

  for (let idx = 0; idx < input.length; idx++) {
    const val = input[idx];
    if (isSwitch(val)) {
      if (isKnownSwitch(val)) {
        const long = isShortSwitch(val) && val in shortLookup
          ? shortLookup[val]
          : val;

        if (!(stripLeading(long, "--") in defn)) {
          throw NoSwitchDefn(`the switch "${long}" was unable to be found in the switch definition provided but somehow it was classified as a known switch. This should not happen.`);
        }
        const key = stripLeading(long, "--") as keyof typeof defn & keyof typeof switches;
        const sw = defn[key] as CliSwitch;
        const typeOf = isArray(sw) ? sw[1] : sw;

        switch (typeOf) {
          case "boolean":
            switches[key] = true;
            break;
          case "number":
            idx++;
            const numToken = input[idx];
            switches[key] = Number(numToken);
            break;
          case "string":
            idx++;
            const strToken = input[idx];
            switches[key] = strToken;
            break;
        }
      }
      else {
        switches.unknown.push(val);
      }
    }
    else {
      args.push(val);
    }
  } // end FOR loop

  return {
    defn,
    args,
    switches: switches as ExpandDictionary<
            FromDefn<NoShort<T>> & Record<"unknown", string[]>
    >,
  };
}
