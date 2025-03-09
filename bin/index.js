#!/usr/bin/env bun run 

// src/index.ts
import { argv, exit as exit3 } from "node:process";

// src/createPrompt.ts
import FastGlob2 from "fast-glob";

// src/constants.ts
import findRoot from "find-root";
import "dotenv/config";
import { cwd as cwd2 } from "node:process";
import { join as join3 } from "pathe";
import { existsSync, readFileSync as readFileSync2 } from "node:fs";
import { createKindError as createKindError3 } from "@yankeeinlondon/kind-error";
import chalk4 from "chalk";

// src/type-guards.ts
import { isObject } from "inferred-types";
var CONFIG_PROPS = [
  "promptDirs",
  "codePath",
  "docPath"
];
function isConfigFile(val) {
  return isObject(val) && Object.keys(val).every((i) => CONFIG_PROPS.includes(i));
}

// src/utils/asString.ts
import { isError, isKindError } from "@yankeeinlondon/kind-error";
import { isArray, isObject as isObject2, isString } from "inferred-types";

// src/utils/parseMarkdown.ts
function parseMarkdown(fileContent) {
  if (fileContent.startsWith("---")) {
    const endOfFrontmatter = fileContent.indexOf("---", 3);
    if (endOfFrontmatter !== -1) {
      const frontMatterContent = fileContent.substring(3, endOfFrontmatter).trim();
      const content = fileContent.substring(endOfFrontmatter + 3).trim();
      const frontMatter = {};
      const lines = frontMatterContent.split("\n");
      for (const line of lines) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          frontMatter[key] = value;
        }
      }
      return [frontMatter, content];
    }
  }
  return [{}, fileContent];
}

// src/utils/codeBlock.ts
import { stripLeading } from "inferred-types";
import { basename, extname } from "pathe";
function codeBlock(text, filename2) {
  return `
##### ${basename(filename2)}

\`\`\`${stripLeading(extname(filename2), ".")}
${text.trim()}
\`\`\`

`;
}

// src/utils/processPrompt.ts
import { isUrl, stripLeading as stripLeading2 } from "inferred-types";
import { readFileSync } from "node:fs";
import { createKindError as createKindError2 } from "@yankeeinlondon/kind-error";
import chalk2 from "chalk";
import FastGlob from "fast-glob";
import { readFile } from "node:fs/promises";
import { exit } from "node:process";

// src/errors.ts
import { createKindError } from "@yankeeinlondon/kind-error";
var InputOutput = createKindError(
  "InputOutput"
);
var ClipboardError = createKindError("ClipboardError");
var BrowserError = createKindError("BrowserError");

// src/utils/processPrompt.ts
import { basename as basename2, join as join2 } from "pathe";
import { ask } from "@yankeeinlondon/ask";

// src/utils/logger.ts
import util from "util";
import chalk from "chalk";
chalk.level = 3;
var CROSS = chalk.bold.red("\u292B");
var CHECK = chalk.bold.green("\u2713");
var INSPECT = chalk.bold("\u{1F453}");
var INFO = chalk.bold("\u2299");
var INFO2 = chalk.bold("\u229A");
function formatMessage(message, indentLevel = 0) {
  let formattedMessage;
  if (typeof message === "string") {
    formattedMessage = message;
  } else {
    formattedMessage = util.inspect(message, { colors: true, depth: null });
  }
  const indent = "  ".repeat(indentLevel);
  return formattedMessage.split("\n").map((line, index) => index === 0 ? line : indent + line).join("\n");
}
function logToStderr(prefix, args2, indentLevel = 0) {
  if (args2.length > 1) {
    process.stderr.write(`${prefix} ${formatMessage(args2[0], indentLevel)}
`);
    for (const arg of args2.slice(1)) {
      process.stderr.write(formatMessage(arg, indentLevel + 1) + "\n");
    }
  } else {
    process.stderr.write(`${prefix} ${formatMessage(args2[0], indentLevel)}
`);
  }
}
function success(...args2) {
  logToStderr(CHECK, args2);
}
function info(...args2) {
  logToStderr(INFO, args2);
}
function infoIndent(...args2) {
  logToStderr(`    ${INFO2}`, args2);
}
function fail(...args2) {
  logToStderr(CROSS, args2);
}
function log(...args2) {
  if (args2.length === 0) {
    process.stderr.write("\n");
  } else {
    logToStderr("", args2);
  }
}

// src/scrape/getPage.ts
import { Browser } from "happy-dom";
import { ensureLeading } from "inferred-types";

// src/scrape/htmlToMd.ts
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { isString as isString2 } from "inferred-types";
async function htmlToMd(page) {
  if (!isString2(page)) {
    const doc = page.mainFrame.document;
    const body = doc.body.outerHTML;
    const md = await unified().use(rehypeParse).use(rehypeRemark).use(remarkStringify).process(body);
    log("markdown conversion", {
      messages: md.messages,
      htmlLength: body.length,
      raw: doc.body.textContent
    });
    return String(md);
  } else {
    const md = await unified().use(rehypeParse).use(rehypeRemark).use(remarkStringify).process(page);
    return String(md);
  }
}

// src/scrape/getPage.ts
import { writeFileSync } from "node:fs";
import { join } from "pathe";
import { cwd } from "node:process";
async function getPage(uri, s, opt) {
  const headers = {
    Accept: "*/*",
    UserAgent: "curl/7.64.1",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    ...opt?.bearerToken ? { Authorization: ensureLeading(opt.bearerToken, "Bearer ") } : {}
  };
  const req = await fetch(uri, { method: "GET", headers });
  const browser = new Browser();
  const page = browser.newPage();
  performance.mark("start");
  const resp = await page.goto(uri);
  if (!resp) {
    return BrowserError(`Unable to get a response from "${uri}"`);
  }
  const code = resp.status;
  const statusText = resp?.statusText;
  if (req?.ok) {
    if (s.verbose) {
      performance.mark("loaded");
      success(`the page "${uri}" was loaded successfully; now waiting for scripts to complete`);
    }
    await page.waitUntilComplete();
    performance.mark("end");
    performance.measure("load-page", "start", "loaded");
    performance.measure("load-to-ready", "loaded", "end");
    performance.measure("total", "start", "end");
    const measurements = [
      "load-page",
      "load-to-ready",
      "total"
    ].map((i) => performance.getEntriesByName(i));
    if (s.verbose) {
      success(`page has completed loading`);
    }
    const main2 = page.mainFrame.content;
    writeFileSync(join(cwd(), "/example.github.html"), main2, "utf-8");
    const md = await htmlToMd(page);
    if (s.verbose) {
      success(`page converted to markdown`);
    }
    writeFileSync(join(cwd(), "/md.md"), md);
  }
  if (IGNORE_INVALID_CERT) {
  }
  browser.close();
}

// src/utils/processPrompt.ts
var InvalidPromptFile = createKindError2(
  "InvalidPromptFile"
);
async function processPrompt(file, s) {
  let content = "";
  let aiderContent = "";
  let codeRefs = [];
  let unmatchedCodeRefs = [];
  let webRefs = [];
  let invalidWebRefs = [];
  let failedWebRefs = [];
  let rawContent = "";
  let errors = [];
  try {
    rawContent = readFileSync(file, "utf-8");
  } catch (err) {
    throw InvalidPromptFile(`The file "${file}" couldn't be loaded as prompt file!`, {
      underlying: err
    });
  }
  const [frontmatter, promptContent] = parseMarkdown(rawContent);
  const isCached = frontmatter?.__cached ? true : false;
  const lines = promptContent.split("\n");
  if (s.verbose) {
    info(`markdown parsed with frontmatter of [${lines.length} lines]`, frontmatter);
  }
  const characters = promptContent.length;
  for (const [idx, line] of lines.entries()) {
    if (line.startsWith("::code ")) {
      const refs = stripLeading2(line, "::code ").split(",").map((i) => i.trim());
      if (s.verbose) {
        info(
          `found ${chalk2.bold.yellow(refs.length)} code reference(s) on line ${idx} of ${file}`,
          refs
        );
      }
      for (const ref of refs) {
        const glob = CODE_PATHS.map((i) => join2(i, `**/*${ref}*`));
        const candidates = await FastGlob(glob);
        if (candidates.length === 1) {
          try {
            const text = await readFile(candidates[0], "utf-8");
            codeRefs.push(candidates[0]);
            content += codeBlock(text, candidates[0]);
            aiderContent += `/add ${candidates[0]}
`;
          } catch (err) {
            errors.push(InputOutput(`Unable to load content of code file: ${candidates[0]}`));
          }
        } else if (candidates.length > 1) {
          log();
          log(`In the prompt file ${chalk2.blue.bold(file)} we found a code reference to "${ref}"`);
          log();
          log(`This reference matches ${chalk2.italic("more")} than one code file in your code path.`);
          const choose = await ask.select("choose", "Which code should we include:", [...candidates, "QUIT"])();
          if (choose === "QUIT") {
            log("Bye");
            log();
            exit(0);
          }
          const text = await readFile(choose, "utf-8");
          content += codeBlock(text, choose);
          aiderContent += `/add ${choose}
`;
        }
      }
    } else if (line.startsWith("::web ")) {
      const urlsCandidates = line.replace("::web ", "").split(",").map((i) => i.trim()).filter((i) => i);
      const validUrls = urlsCandidates.filter((i) => isUrl(i, "http", "https"));
      if (validUrls.length !== urlsCandidates.length) {
        const invalid = urlsCandidates.filter((i) => !isUrl(i, "http", "https"));
        for (const u of invalid) {
          fail(`"${u}" is an invalid URL; found on line ${chalk2.bold.yellow(idx)} of the ${chalk2.bold.blue(basename2(file))} prompt file`);
        }
      }
      if (s.verbose) {
        info(`found ${chalk2.bold.yellow(validUrls.length)} valid urls on line ${chalk2.bold(idx)} of ${chalk2.bold.blue(basename2(file))}`);
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
    } else {
      content += line + "\n";
      aiderContent += line + "\n";
    }
  }
  return {
    kind: "prompt",
    promptFile: file,
    frontmatter,
    characters,
    isCached,
    lines: lines.length,
    content: content.trimEnd() + "\n",
    aiderContent,
    codeRefs,
    unmatchedCodeRefs,
    webRefs,
    invalidWebRefs,
    failedWebRefs,
    errors
  };
}

// src/utils/prettyFile.ts
import chalk3 from "chalk";
import { stripAfter } from "inferred-types";
import { basename as basename3, dirname, extname as extname2 } from "pathe";
chalk3.level = 3;
function prettyFile(file) {
  const base = chalk3.dim(dirname(file));
  const fileName = chalk3.blue.bold(stripAfter(basename3(file), "."));
  const ext = chalk3.dim(extname2(file));
  return `${base}/${fileName}${ext}`;
}

// src/utils/link.ts
function link(text, link2) {
  return `\x1B]8;;${link2}\x1B\\${text}\x1B]8;;\x1B\\`;
}

// src/utils/toClipboard.ts
import clipboardy from "clipboardy";
async function toClipboard(text) {
  try {
    await clipboardy.write(text);
    return true;
  } catch (error) {
    return ClipboardError(
      `Problem copying content to the clipboard`,
      { underlying: error }
    );
  }
}

// src/utils/updatePromptFile.ts
async function updatePromptFile(_p) {
}

// src/constants.ts
import { isTruthy } from "inferred-types/runtime";
var IGNORE_INVALID_CERT = isTruthy(process.env.IGNORE_INVALID_CERT) ? true : false;
var ROOT = findRoot(cwd2()) || cwd2();
var CONFIG_FILE = join3(ROOT, "/.prompt.json");
var InvalidConfig = createKindError3(
  "InvalidConfig"
);
var _CONFIG;
if (existsSync(CONFIG_FILE)) {
  try {
    const data = readFileSync2(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (isConfigFile(parsed)) {
      success(`using the config file at ${chalk4.blue(CONFIG_FILE)}`);
      _CONFIG = parsed;
    } else {
      _CONFIG = void 0;
      fail(`a config file was found at ${chalk4.blue(CONFIG_FILE)} and was ${chalk4.italic("parsed")} but appears to be of the wrong format.`);
    }
  } catch (err) {
    _CONFIG = void 0;
    fail(`a config file was found at ${chalk4.blue(CONFIG_FILE)} but it could not be parsed into a configuration file!
`);
  }
}
var CONFIG = _CONFIG;
var PROMPTS_DIR = [
  ...CONFIG ? CONFIG.promptDirs ? CONFIG.promptDirs : [`${ROOT}/prompts`] : [`${ROOT}/prompts`],
  ...process.env.PROMPTS ? process.env.PROMPTS.split(":") : []
];
var PROMPTS_GLOB = PROMPTS_DIR.map((i) => join3(i, `/**/*.(md|txt)`));
var CODE_PATHS = [
  ...CONFIG && CONFIG.codePath ? CONFIG.codePath : [
    `${ROOT}/src`,
    `${ROOT}/test`,
    `${ROOT}/tests`
  ],
  ...process.env.CODE ? process.env.CODE.split(":") : []
];

// src/createPrompt.ts
import { ask as ask2, ask as q } from "@yankeeinlondon/ask";
import chalk5 from "chalk";
import { cwd as cwd3, exit as exit2 } from "node:process";
import { resolve } from "pathe";
import { writeFileSync as writeFileSync2 } from "node:fs";
import { relative } from "node:path";
async function processPrompts(files, s) {
  const wait = files.map((i) => processPrompt(i, s));
  const results = await Promise.all(wait);
  return results;
}
async function createPrompt(args2, s) {
  const promptFiles = [];
  const promptContent = [];
  log();
  const candidates = await FastGlob2(PROMPTS_GLOB);
  if (candidates.length === 0) {
    fail(`no prompts found; run ${chalk5.blue.bold("prompt --env")} to better understand the current configuration of the CLI`);
    exit2(1);
  } else {
    info(`${chalk5.bold.yellow(candidates.length)} candidate ${chalk5.bold("prompt")} files found in the path`);
  }
  let freeFormQuestion = "";
  let requiresConfirmation = false;
  for (const [idx, arg] of args2.entries()) {
    const found = candidates.filter((c) => c.includes(arg));
    if (found.length > 0) {
      const exactMatches = found.filter((i) => arg === i);
      if (exactMatches.length === 1) {
        success(`Matched the prompt file "${arg}" -> ${resolve(cwd3(), exactMatches[0])}`);
      } else if (exactMatches.length > 1) {
        confirm(`We found more than one prompt file which matches "${arg}"
`);
        promptFiles.push(
          await q.select("select", "Choose which file to use", exactMatches)()
        );
      } else if (found.length === 1) {
        success(`Matched the prompt file "${arg}" -> ${resolve(cwd3(), found[0])}`);
        promptFiles.push(found[0]);
      } else if (found.length > 1) {
        requiresConfirmation = true;
        confirm(`We found more than one prompt file which matches "${arg}"
`);
        promptFiles.push(
          await q.select("select", "Choose which file to use", exactMatches)()
        );
      }
    } else {
      const remainingHaveExt = args2.slice(idx).some(
        (i) => i.endsWith(".md") || i.endsWith(".txt")
      );
      if (remainingHaveExt) {
        requiresConfirmation = true;
        fail(`the text "${chalk5.bold(arg)}" ${chalk5.dim.italic(`-- as well as the variant "${chalk5.bold(`${arg}.md`)}" --`)} found no match for prompt files`);
        console.log();
        const action = q.select(
          "action",
          `What action should we take?`,
          {
            "skip this text and continue with the rest": "skip",
            "quit for now to restate the CLI command": "quit"
          }
        );
        const answer = await action();
        if (answer === "quit") {
          exit2(1);
        }
      } else {
        if (arg.length > 15 && arg.includes(" ")) {
          requiresConfirmation = true;
          freeFormQuestion = args2.slice(idx).join(" ");
          success("set freeform text to be added to end of prompt");
          break;
        } else {
          requiresConfirmation = true;
          fail(`the parameter ${chalk5.bold.red(arg)} was not matched to a template and will be dropped.`);
        }
      }
    }
  }
  if (requiresConfirmation) {
    log();
    const promptMsg = promptFiles.length > 0 ? `The prompt files, ${chalk5.italic("in order")}, are:
${promptFiles.map((i) => `  - ${prettyFile(i)}`).join("\n")}` : `${chalk5.bold.italic("No")} prompt files where found in the params!`;
    const freeform = freeFormQuestion === "" ? "" : promptFiles.length > 0 ? `The following ${chalk5.bold("freeform question")} will be appended to the end of the prompt chain:

    ${chalk5.italic(freeFormQuestion)}
` : `The following ${chalk5.bold("freeform question")} will be the full extent of the prompt as no prompt
  references were found:

    ${chalk5.italic(freeFormQuestion)}
`;
    info(promptMsg);
    if (freeform) {
      info(freeform);
    }
    if (await q.confirm("confirm", `Continue?`)()) {
    } else {
      exit2(1);
    }
  }
  let prompts = [];
  if (promptFiles.length > 0) {
    info(
      `processing prompts [${chalk5.bold.yellow(promptFiles.length)}] for inline references`
    );
    prompts = await processPrompts(promptFiles, s);
  }
  const prompt = prompts.map((i) => i.content).join("\n") + `
${freeFormQuestion}
`;
  const copied = await toClipboard(prompts[0].content);
  if (copied) {
    log();
    success(`the prompt has been copied to the clipboard!`);
  } else {
    fail(`failed to copy prompt to the clipboard: ${copied.message}`);
  }
  if (s.output) {
    writeFileSync2(prompt, s.output, "utf-8");
    success(`the prompt was saved to ${chalk5.blue.bold(s.output)}`);
  }
  if (s.replace) {
    for (const p of prompts) {
      if (p.isCached && !s.refresh) {
        info(`the "${prettyFile(relative(cwd3(), p.promptFile))}" prompt file was ${chalk5.italic("already")} in a cached state.`);
        infoIndent(`this file will be left unchanged as it was ${chalk5.italic("not")} re-evaluated for this prompt`);
        infoIndent(`if you want to have the files and web references ${chalk5.italic("re-evaluated")} add the ${chalk5.blue(`--refresh`)} flag to your command`);
      } else {
        if (s.yes || ask2.confirm(
          `confirm`,
          `Save the "${prettyFile(relative(cwd3(), p.promptFile))}" with the ${chalk5.italic("interpolated")} results?`
        )) {
          await updatePromptFile(p);
          success(`prompt file ${chalk5.bold.blue(relative(cwd3(), p.promptFile))} saved backed to source`);
        }
      }
    }
  }
}

// src/help.ts
import chalk6 from "chalk";
function help() {
  log();
  log(chalk6.bold.blue("prompt ") + chalk6.bgWhiteBright.blackBright(" CLI "));
  log(chalk6.dim.italic(`a CLI for building powerful AI prompts.`));
  log();
  log(`- ${chalk6.bold("Syntax:")} ${chalk6.bold.blue("prompt")} <${chalk6.dim.italic("prompt file ref")}> ${chalk6.grey.italic("<prompt file ref>")}${chalk6.dim("[]")} "<${chalk6.dim.italic("freeform text")}>"`);
  log();
  log(`    ${INFO} ${chalk6.italic("prompt files")} should be markdown or text files with either 
       a .md or .txt file extension.`);
  log(`    ${INFO} the ${chalk6.italic("directories")} where these files should reside are:`);
  log(`        ${INFO2} by default it will look in "${chalk6.blueBright(`\${${chalk6.yellow("ProjRoot")}}/prompts`)}" directory ${chalk6.italic("(and sub-directories)")}`);
  log(`        ${INFO2} if you want to ${chalk6.italic("add")} more directories to the possible locations just set the ${chalk6.bold("PROMPTS")}`);
  log(`          env variable. This variable will be delimited by the ${chalk6.bold.blue(":")} character as is common`);
  log(`          in ENV variables.`);
  log(`        ${INFO2} you can also add a ${chalk6.blue.bold(".prompt.json")} file in the ProjRoot of a repo and set ${chalk6.bold.blue("promptDirs")} to the `);
  log(`          directory/directories you want to use within this repo.  When this property is set`);
  log(`          the ${chalk6.italic("default")} value of "${chalk6.blueBright(`\${${chalk6.yellow("ProjRoot")}}/prompts`)}" will be ${chalk6.bold("overwritten")} but any additional`);
  log(`          directories you've specified with the ${chalk6.bold("PROMPT")} ENV variable will still be used`);
  log(`          for fallback.`);
  log();
  log(`- ${chalk6.bold("Prompt Files")}`);
  log();
  log(`    ${INFO} prompt files are text files with super powers`);
  log(`    ${INFO} we recommend Markdown files but plain text files are ok too`);
  log(`    ${INFO} any line in a prompt file which starts with ${chalk6.bold.green("::code")} is a "code reference directive":`);
  log(`        ${INFO2} an example usage would be: ${chalk6.bold.green("::code Dictionary.ts, Data.json")}`);
  log(`        ${INFO2} using this example, the filenames ${chalk6.bold.blue("Dictionary.ts")} and ${chalk6.bold.blue("Data.json")} will be searched`);
  log(`          for in the ${chalk6.italic("code path")}; where the "code path" is by default the following:`);
  log(`               - "${chalk6.blueBright(`\${${chalk6.yellow("ProjRoot")}}/src`)}"`);
  log(`               - "${chalk6.blueBright(`\${${chalk6.yellow("ProjRoot")}}/test`)}"`);
  log(`               - "${chalk6.blueBright(`\${${chalk6.yellow("ProjRoot")}}/tests`)}"`);
  log(`        ${INFO2} by setting the ${chalk6.bold.blue("codePath")} variable in a repo's ${chalk6.blue.bold(".prompt.json")} file you can`);
  log(`          override this to whatever you want`);
  log(`     ${INFO} in addition to ${chalk6.italic("code")} references there are also ${chalk6.bold("web")} and ${chalk6.bold("doc")} references:`);
  log(`        ${INFO2} a ${chalk6.bold("web")} reference brings in a summary for a webpage`);
  log(`        ${INFO2} a ${chalk6.bold("doc")} reference allows the injection of ${chalk6.italic("sub-contextual")} information and`);
  log(`          allows for more granular reuse patterns`);
  log(`    ${INFO} see the ${link(chalk6.bold.blue.underline("docs"), `https://github.com/yankeeinlondon/promptly/README.md`)} for more info on these reference types`);
  log();
  log(`- ${chalk6.bold("CLI Flags")}`);
  log();
  log(`    ${INFO} ${chalk6.bgGrey.whiteBright(` --output ${chalk6.dim("<filename>")} `)}, ${chalk6.bgGrey.whiteBright(` -o ${chalk6.dim("<filename>")} `)}`);
  log(`        ${INFO2} every successful run of the CLI puts the ${chalk6.italic("interpolated")} prompt on the clipboard`);
  log(`        ${INFO2} by having it on the clipboard it becomes easy to copy it into open chat`);
  log(`          windows ${chalk6.italic.dim("(if that's how you role)")}`);
  log(`        ${INFO2} but using this flag allows you to export it to a local file if you prefer`);
  log(`    ${INFO} ${chalk6.bgGrey.whiteBright(` --replace `)}`);
  log(`        ${INFO2} similar to the --output flag but instead of providing a file name, it will ${chalk6.italic("replace")}`);
  log(`          the input prompt templates with ${chalk6.italic("interpolated")} versions of themselves`);
  log(`    ${INFO} ${chalk6.bgGrey.whiteBright(" --aider ")}`);
  log(`        ${INFO2} this CLI can be used as a ${chalk6.italic("frontend")} for ${link(chalk6.bold.blue("Aider"), "https://aider.org")}`);
  log(`        ${INFO2} when this flag is used the ${chalk6.bold("web")} and ${chalk6.bold("file")} interpolations normally done will instead`);
  log(`          be converted into ${chalk6.blue.bold("/add")} and ${chalk6.blue.bold("/web")} commands and the Prompt along with these commands`);
  log(`          will be streamed into aider and processed there`);
  log(`    ${INFO} ${chalk6.bgGrey.whiteBright(" --dry-run ")}`);
  log(`        ${INFO2} prevents the references found in Prompt files from being interpolated into the prompts`);
  log(`        ${INFO2} instead it just reports on the structure of the prompt `);
  log(`        ${INFO2} useful way to quickly check that your CLI command is structurally sound`);
}

// src/envReport.ts
import chalk8 from "chalk";

// src/report.ts
import chalk7 from "chalk";
import { dirname as dirname2 } from "path";
import { relative as relative2 } from "pathe";
import { filename } from "pathe/utils";
function codeDirectories() {
  const dirs = CODE_PATHS.map(
    (i) => {
      const rel = relative2(process.cwd(), i);
      return `- ${chalk7.blue(dirname2(rel))}/${chalk7.bold.blue(filename(rel))}`;
    }
  );
  console.log(`The prompt's ${chalk7.italic("inline code references")} are looked for this repo's directories:`);
  console.log("");
  console.log(dirs.join("\n"));
  console.log();
}
function promptDirectories() {
  log(`The CLI looks for ${chalk7.bold("prompts")} in the following directories:`);
  log();
  log(PROMPTS_DIR.map((i) => `  ${INFO} ${i}`).join("\n"));
  log();
}

// src/envReport.ts
import FastGlob3 from "fast-glob";
import { dirname as dirname3 } from "pathe";
async function envReport() {
  log(`ENV for ${chalk8.bold.blue("prompt")} CLI`);
  log();
  log(`The CLI is being run in the ${chalk8.bold.blue(dirname3(process.env.PWD))} directory`);
  log(`    ${INFO} the detected repo root is ${ROOT}`);
  log();
  log();
  promptDirectories();
  log(`Based on these directories the glob pattern for prompts is:`);
  PROMPTS_GLOB.map((i) => {
    log(`    ${INFO} "${i}"`);
  });
  log();
  log(`Which results in the discovery of the following ${chalk8.bold("prompt")} files:`);
  const files = await FastGlob3(PROMPTS_GLOB);
  for (const file of files) {
    log(`    ${INFO} ${prettyFile(file)}`);
  }
  log();
  codeDirectories();
}

// src/utils/configSwitches.ts
import { createKindError as createKindError4 } from "@yankeeinlondon/kind-error";
import { ensureLeading as ensureLeading2, isArray as isArray2, isString as isString3, stripLeading as stripLeading3 } from "inferred-types";
var NoSwitchDefn = createKindError4(
  "NoSwitchDefn"
);
function configSwitches(input, defn) {
  input = input.slice(2);
  const args2 = [];
  const switches2 = {
    unknown: []
  };
  const shortLookup = Object.entries(defn).reduce(
    (acc, [key, val]) => {
      if (isArray2(val) && isString3(val[0])) {
        return { ...acc, [ensureLeading2(val[0], "-")]: ensureLeading2(key, "--") };
      } else return acc;
    },
    {}
  );
  const switchValues = [
    // long swiches
    ...Object.keys(defn).map((i) => ensureLeading2(i, "--")),
    // short swiches
    ...Object.values(defn).filter(
      (i) => isArray2(i)
    ).map(
      (i) => ensureLeading2(i[0], "-")
    )
  ];
  function isSwitch(val) {
    return val.startsWith("-");
  }
  function isKnownSwitch(val) {
    return switchValues.some((i) => val.startsWith(i));
  }
  function isShortSwitch(val) {
    return val.startsWith("-") && !val.startsWith("--");
  }
  for (let idx = 0; idx < input.length; idx++) {
    const val = input[idx];
    if (isSwitch(val)) {
      if (isKnownSwitch(val)) {
        const long = isShortSwitch(val) && val in shortLookup ? shortLookup[val] : val;
        if (!(stripLeading3(long, "--") in defn)) {
          throw NoSwitchDefn(`the switch "${long}" was unable to be found in the switch definition provided but somehow it was classified as a known switch. This should not happen.`);
        }
        const key = stripLeading3(long, "--");
        const sw = defn[key];
        const typeOf = isArray2(sw) ? sw[1] : sw;
        switch (typeOf) {
          case "boolean":
            switches2[key] = true;
            break;
          case "number":
            idx++;
            const numToken = input[idx];
            switches2[key] = Number(numToken);
            break;
          case "string":
            idx++;
            const strToken = input[idx];
            switches2[key] = strToken;
            break;
        }
      } else {
        switches2["unknown"].push(val);
      }
    } else {
      args2.push(val);
    }
  }
  return {
    defn,
    args: args2,
    switches: switches2
  };
}

// src/index.ts
var { args, switches } = configSwitches(argv, {
  output: ["o", "string"],
  replace: "boolean",
  refresh: "boolean",
  aider: "boolean",
  env: "boolean",
  "dry-run": "boolean",
  "verbose": ["v", "boolean"],
  help: ["h", "boolean"],
  yes: ["y", "boolean"]
});
async function main() {
  if (switches.env) {
    await envReport();
    exit3(0);
  }
  if (args.length === 0 || switches.help) {
    help();
    exit3(0);
  }
  return await createPrompt(args, switches);
}
await main();
//# sourceMappingURL=index.js.map