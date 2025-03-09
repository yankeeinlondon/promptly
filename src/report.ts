import { CODE_PATHS, PROMPTS_DIR } from "./constants";
import chalk from "chalk";
import { dirname } from "path";
import { relative } from "pathe";
import { filename } from "pathe/utils";
import { INFO, log } from "./utils";

/**
 * Prints the _directories_ we are looking in for the inline file 
 * references.
 */
export function codeDirectories() {

    const dirs = CODE_PATHS.map(
        i => {
            const rel = relative(process.cwd(), i);
            return `- ${chalk.blue(dirname(rel))}/${chalk.bold.blue(filename(rel))}`
        }
    )

    console.log(`The prompt's ${chalk.italic("inline code references")} are looked for this repo's directories:`)
    console.log("")
    console.log(dirs.join("\n"))
    console.log();
}

export function promptDirectories() {
    log(`The CLI looks for ${chalk.bold("prompts")} in the following directories:`)
    log()
    log(PROMPTS_DIR.map(i => `  ${INFO} ${i}`).join("\n"))
    log();
}
