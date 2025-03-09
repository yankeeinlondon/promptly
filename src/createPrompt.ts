import type { Switches } from ".";
import type { Prompt } from "./types";
import { writeFileSync } from "node:fs";
import { relative } from "node:path";
import { cwd, exit } from "node:process";
import { ask, ask as q } from "@yankeeinlondon/ask";
import chalk from "chalk";
import FastGlob from "fast-glob";
import { resolve } from "pathe";
import { PROMPTS_GLOB } from "./constants";
import {
  confirm,
  fail,
  info,
  infoIndent,
  log,
  prettyFile,
  processPrompt,
  success,
  toClipboard,
  updatePromptFile,
} from "./utils";

/**
 * replaces all requests for `file` or `web` resources
 */
async function processPrompts(
  files: string[],
  s: Switches,
): Promise<Prompt[]> {
  const wait = files.map(i => processPrompt(i, s));
  const results = await Promise.all(wait) as Prompt[];

  return results;
}

/**
 * Combine one or more **prompt** files and replace all `file` and `web` references
 * with the appropriate content.
 *
 * Output is always placed on the clipboard but if `-o <filename>` is provided then
 * it will also write to a file.
 */
export async function createPrompt(args: string[], s: Switches) {
  const promptFiles: string[] = [];
  const _promptContent = [];
  log();

  const candidates = await FastGlob(PROMPTS_GLOB);
  if (candidates.length === 0) {
    fail(`no prompts found; run ${chalk.blue.bold("prompt --env")} to better understand the current configuration of the CLI`);
    exit(1);
  }
  else {
    info(`${chalk.bold.yellow(candidates.length)} candidate ${chalk.bold("prompt")} files found in the path`);
  }
  let freeFormQuestion = "";

  let requiresConfirmation = false;

  for (const [idx, arg] of args.entries()) {
    /** matched prompt files */
    const found = candidates.filter(c => c.includes(arg));

    if (found.length > 0) {
      const exactMatches = found.filter(i => arg === i);
      if (exactMatches.length === 1) {
        success(`Matched the prompt file "${arg}" -> ${resolve(cwd(), exactMatches[0])}`);
      }
      else if (exactMatches.length > 1) {
        confirm(`We found more than one prompt file which matches "${arg}"\n`);
        promptFiles.push(
          await q.select("select", "Choose which file to use", exactMatches)(),
        );
      }
      else if (found.length === 1) {
        success(`Matched the prompt file "${arg}" -> ${resolve(cwd(), found[0])}`);
        promptFiles.push(found[0]);
      }
      else if (found.length > 1) {
        requiresConfirmation = true;
        confirm(`We found more than one prompt file which matches "${arg}"\n`);
        promptFiles.push(
          await q.select("select", "Choose which file to use", exactMatches)(),
        );
      }
    }
    else {
      // no matches found with available prompts

      const remainingHaveExt = args.slice(idx).some(
        i => i.endsWith(".md") || i.endsWith(".txt"),
      );

      if (remainingHaveExt) {
        requiresConfirmation = true;
        fail(`the text "${chalk.bold(arg)}" ${chalk.dim.italic(`-- as well as the variant "${chalk.bold(`${arg}.md`)}" --`)} found no match for prompt files`);
        console.log();
        const action = q.select(
          "action",
          `What action should we take?`,
          {
            "skip this text and continue with the rest": "skip",
            "quit for now to restate the CLI command": "quit",
          },
        );
        const answer = await action();
        if (answer === "quit") {
          exit(1);
        }
      }
      else {
        if (
          arg.length > 15 && arg.includes(" ")
        ) {
          requiresConfirmation = true;
          freeFormQuestion = args.slice(idx).join(" ");
          success("set freeform text to be added to end of prompt");
          break;
        }
        else {
          requiresConfirmation = true;
          fail(`the parameter ${chalk.bold.red(arg)} was not matched to a template and will be dropped.`);
        }
      }
    }
  } // end prompt files

  if (requiresConfirmation) {
    log();
    const promptMsg = promptFiles.length > 0
      ? `The prompt files, ${chalk.italic("in order")}, are:\n${promptFiles.map(i => `  - ${prettyFile(i)}`).join("\n")}`
      : `${chalk.bold.italic("No")} prompt files where found in the params!`;
    const freeform = freeFormQuestion === ""
      ? ""
      : promptFiles.length > 0
        ? `The following ${chalk.bold("freeform question")} will be appended to the end of the prompt chain:\n\n    ${chalk.italic(freeFormQuestion)}\n`
        : `The following ${chalk.bold("freeform question")} will be the full extent of the prompt as no prompt\n  references were found:\n\n    ${chalk.italic(freeFormQuestion)}\n`;

    info(promptMsg);
    if (freeform) {
      info(freeform);
    }

    if (
      await q.confirm("confirm", `Continue?`)()
    ) {
      // no-op
    }
    else {
      exit(1);
    }
  }

  let prompts: Prompt[] = [];

  if (promptFiles.length > 0) {
    info(
      `processing prompts [${chalk.bold.yellow(promptFiles.length)}] for inline references`,
    );
    /**
     * the `code`, `doc` and `web` resource requests embedded in the
     * prompt file(s)
     */
    prompts = await processPrompts(promptFiles, s);
  }
  const prompt = `${prompts.map(i => i.content).join("\n")}\n${freeFormQuestion}\n`;

  const copied = await toClipboard(prompts[0].content);
  if (copied) {
    log();
    success(`the prompt has been copied to the clipboard!`);
  }
  else {
    fail(`failed to copy prompt to the clipboard: ${(copied as Error).message}`);
  }

  if (s.output) {
    writeFileSync(prompt, s.output, "utf-8");
    success(`the prompt was saved to ${chalk.blue.bold(s.output)}`);
  }

  if (s.replace) {
    for (const p of prompts) {
      if (p.isCached && !s.refresh) {
        info(`the "${prettyFile(relative(cwd(), p.promptFile))}" prompt file was ${chalk.italic("already")} in a cached state.`);
        infoIndent(`this file will be left unchanged as it was ${chalk.italic("not")} re-evaluated for this prompt`);
        infoIndent(`if you want to have the files and web references ${chalk.italic("re-evaluated")} add the ${chalk.blue(`--refresh`)} flag to your command`);
      }
      else {
        if (
          s.yes
          || ask.confirm(
            `confirm`,
            `Save the "${prettyFile(relative(cwd(), p.promptFile))}" with the ${chalk.italic("interpolated")} results?`,
          )
        ) {
          await updatePromptFile(p);
          success(`prompt file ${chalk.bold.blue(relative(cwd(), p.promptFile))} saved backed to source`);
        }
      }
    }
  }
}
