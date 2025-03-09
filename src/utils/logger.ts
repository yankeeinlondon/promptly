import util from "node:util";
import chalk from "chalk";

chalk.level = 3; // Force full 24-bit color support

export const CROSS = chalk.bold.red("⤫");
export const CHECK = chalk.bold.green("✓");
export const INSPECT = chalk.bold("👓");
export const INFO = chalk.bold("⊙");
export const INFO2 = chalk.bold("⊚");

function formatMessage(message: unknown, indentLevel: number = 0): string {
  let formattedMessage: string;

  // Preserve chalk formatting for strings
  if (typeof message === "string") {
    formattedMessage = message;
  }
  else {
    // Format objects with colors, depth, and better readability
    formattedMessage = util.inspect(message, { colors: true, depth: null });
  }

  // Indent multiline messages correctly
  const indent = "  ".repeat(indentLevel);
  return formattedMessage
    .split("\n")
    .map((line, index) => (index === 0 ? line : indent + line))
    .join("\n");
}

function logToStderr(prefix: string, args: unknown[], indentLevel = 0) {
  if (args.length > 1) {
    process.stderr.write(`${prefix} ${formatMessage(args[0], indentLevel)}\n`);
    for (const arg of args.slice(1)) {
      process.stderr.write(`${formatMessage(arg, indentLevel + 1)}\n`);
    }
  }
  else {
    process.stderr.write(`${prefix} ${formatMessage(args[0], indentLevel)}\n`);
  }
}

export function success(...args: unknown[]) {
  logToStderr(CHECK, args);
}

export function info(...args: unknown[]) {
  logToStderr(INFO, args);
}

export function infoIndent(...args: unknown[]) {
  logToStderr(`    ${INFO2}`, args);
}

export function confirm(...args: unknown[]) {
  logToStderr(INSPECT, args);
}

export function fail(...args: unknown[]) {
  logToStderr(CROSS, args);
}

export function log(...args: unknown[]) {
  if (args.length === 0) {
    process.stderr.write("\n");
  }
  else {
    logToStderr("", args);
  }
}

export function stdout(...args: unknown[]) {
  if (args.length > 1) {
    console.group(args[0]);
    for (const a of args.slice(1)) {
      console.log(a);
    }
  }
  else {
    console.log(args[0]);
  }
}
