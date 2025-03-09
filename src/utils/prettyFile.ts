import chalk from "chalk";
import { stripAfter } from "inferred-types";
import { basename, dirname, extname } from "pathe";

chalk.level = 3;

export function prettyFile(file: string) {
  const base = chalk.dim(dirname(file));
  const fileName = chalk.blue.bold(stripAfter(basename(file), "."));
  const ext = chalk.dim(extname(file));
  return `${base}/${fileName}${ext}`;
}
