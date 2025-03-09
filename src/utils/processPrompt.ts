import type { Uri } from "inferred-types";
import type { Switches } from "../index";
import type { FailedWebRef, Prompt } from "~/types";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { exit } from "node:process";
import { ask } from "@yankeeinlondon/ask";

import { createKindError } from "@yankeeinlondon/kind-error";
import chalk from "chalk";
import FastGlob from "fast-glob";
import { isUrl, stripLeading } from "inferred-types";
import { basename, join } from "pathe";
import { CODE_PATHS } from "~/constants";
import { InputOutput } from "~/errors";
import { getPage } from "~/scrape";
import { codeBlock } from "./codeBlock";
import { fail, info, infoIndent, log } from "./logger";
import { parseMarkdown } from "./parseMarkdown";

const InvalidPromptFile = createKindError(
  "InvalidPromptFile",
);

export async function processPrompt(
  file: string,
  s: Switches,
) {
  let content = "";
  let aiderContent = "";
  const codeRefs: string[] = [];
  const unmatchedCodeRefs: string[] = [];
  const webRefs: Uri<"http" | "https">[] = [];
  const invalidWebRefs: string[] = [];
  const failedWebRefs: FailedWebRef[] = [];
  let rawContent: string = "";
  const errors: Error[] = [];

  try {
    rawContent = readFileSync(file, "utf-8");
  }
  catch (err) {
    throw InvalidPromptFile(`The file "${file}" couldn't be loaded as prompt file!`, {
      underlying: err as Error | string,
    });
  }

  const [frontmatter, promptContent] = parseMarkdown(rawContent);

  const isCached = !!frontmatter?.__cached;

  const lines = promptContent.split("\n");

  if (s.verbose) {
    info(`markdown parsed with frontmatter of [${lines.length} lines]`, frontmatter);
  }

  const characters = promptContent.length;

  // Iterate over lines
  for (const [idx, line] of lines.entries()) {
    if (line.startsWith("::code ")) {
      const refs = stripLeading(line, "::code ")
        .split(",")
        .map(i => i.trim());
      if (s.verbose) {
        info(
          `found ${chalk.bold.yellow(refs.length)} code reference(s) on line ${idx} of ${file}`,
          refs,
        );
      }

      for (const ref of refs) {
        const glob = CODE_PATHS.map(i => join(i, `**/*${ref}*`));
        const candidates = await FastGlob(glob);
        if (candidates.length === 1) {
          try {
            const text = await readFile(candidates[0], "utf-8");
            codeRefs.push(candidates[0]);
            content += codeBlock(text, candidates[0]);
            aiderContent += `/add ${candidates[0]}\n`;
          }
          catch (err) {
            errors.push(InputOutput(`Unable to load content of code file: ${candidates[0]}`, { err }));
          }
        }
        else if (candidates.length > 1) {
          log();
          log(`In the prompt file ${chalk.blue.bold(file)} we found a code reference to "${ref}"`);
          log();
          log(`This reference matches ${chalk.italic("more")} than one code file in your code path.`);

          const choose = await ask.select("choose", "Which code should we include:", [...candidates, "QUIT"])();

          if (choose === "QUIT") {
            log("Bye");
            log();
            exit(0);
          }
          const text = await readFile(choose, "utf-8");
          content += codeBlock(text, choose);
          aiderContent += `/add ${choose}\n`;
        }
      }
    }
    else if (line.startsWith("::web ")) {
      const urlsCandidates = line.replace("::web ", "").split(",").map(i => i.trim()).filter(i => i);
      const validUrls = urlsCandidates.filter(i => isUrl(i, "http", "https"));
      if (validUrls.length !== urlsCandidates.length) {
        const invalid = urlsCandidates.filter(i => !isUrl(i, "http", "https"));
        for (const u of invalid) {
          fail(`"${u}" is an invalid URL; found on line ${chalk.bold.yellow(idx)} of the ${chalk.bold.blue(basename(file))} prompt file`);
        }
      }
      if (s.verbose) {
        info(`found ${chalk.bold.yellow(validUrls.length)} valid urls on line ${chalk.bold(idx)} of ${chalk.bold.blue(basename(file))}`);
        if (s.verbose) {
          for (const u of validUrls) {
            infoIndent(u);
          }
        }
        for (const u of validUrls) {
          const md = await getPage(u, s);

          content += `

##### Webpage Content of ${u}

\`\`\`md
${md}
\`\`\`
`;
        }
      }
    }
    else {
      content += `${line}\n`;
      aiderContent += `${line}\n`;
    }
  }

  return {
    kind: "prompt",
    promptFile: file,
    frontmatter,
    characters,
    isCached,
    lines: lines.length,
    content: `${content.trimEnd()}\n`,
    aiderContent,
    codeRefs,
    unmatchedCodeRefs,
    webRefs,
    invalidWebRefs,
    failedWebRefs,
    errors,
  } satisfies Prompt;
}
