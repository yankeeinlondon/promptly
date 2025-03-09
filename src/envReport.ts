import chalk from "chalk";
import { PROMPTS_GLOB, ROOT } from "./constants";
import { codeDirectories, promptDirectories } from "./report";

import FastGlob from "fast-glob";
import { dirname } from "pathe";
import { INFO, log, prettyFile } from "./utils";

export async function envReport() {
    log(`ENV for ${chalk.bold.blue("prompt")} CLI`);
    log();
    log(`The CLI is being run in the ${chalk.bold.blue(dirname(process.env.PWD as string))} directory`)
    log(`    ${INFO} the detected repo root is ${ROOT}`)
    log();
    log()
    promptDirectories();
    log(`Based on these directories the glob pattern for prompts is:`)
    PROMPTS_GLOB.map(i => {
        log(`    ${INFO} "${i}"`)
    })
    log();
    log(`Which results in the discovery of the following ${chalk.bold("prompt")} files:`)
    const files = await FastGlob(PROMPTS_GLOB);
    for (const file of files) {
        log(`    ${INFO} ${prettyFile(file)}`)
    }
    log();
    codeDirectories();
}
