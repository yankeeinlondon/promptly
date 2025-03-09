
import chalk from "chalk";
import { INFO, INFO2, link, log } from "./utils";

export function help() {
    log();
    log(chalk.bold.blue("prompt ") + chalk.bgWhiteBright.blackBright(" CLI "));
    log(chalk.dim.italic(`a CLI for building powerful AI prompts.`))
    log();

    log(`- ${chalk.bold("Syntax:")} ${chalk.bold.blue("prompt")} <${chalk.dim.italic("prompt file ref")}> ${chalk.grey.italic("<prompt file ref>")}${chalk.dim("[]")} "<${chalk.dim.italic("freeform text")}>"`)
    log()
    log(`    ${INFO} ${chalk.italic("prompt files")} should be markdown or text files with either \n       a .md or .txt file extension.`)
    log(`    ${INFO} the ${chalk.italic("directories")} where these files should reside are:`)
    log(`        ${INFO2} by default it will look in "${chalk.blueBright(`\${${chalk.yellow("ProjRoot")}}/prompts`)}" directory ${chalk.italic("(and sub-directories)")}`)
    log(`        ${INFO2} if you want to ${chalk.italic("add")} more directories to the possible locations just set the ${chalk.bold("PROMPTS")}`)
    log(`          env variable. This variable will be delimited by the ${chalk.bold.blue(":")} character as is common`)
    log(`          in ENV variables.`)
    log(`        ${INFO2} you can also add a ${chalk.blue.bold(".prompt.json")} file in the ProjRoot of a repo and set ${chalk.bold.blue("promptDirs")} to the `)
    log(`          directory/directories you want to use within this repo.  When this property is set`)
    log(`          the ${chalk.italic("default")} value of "${chalk.blueBright(`\${${chalk.yellow("ProjRoot")}}/prompts`)}" will be ${chalk.bold("overwritten")} but any additional`)
    log(`          directories you've specified with the ${chalk.bold("PROMPT")} ENV variable will still be used`)
    log(`          for fallback.`)
    log()
    log(`- ${chalk.bold("Prompt Files")}`)
    log()
    log(`    ${INFO} prompt files are text files with super powers`)
    log(`    ${INFO} we recommend Markdown files but plain text files are ok too`)
    log(`    ${INFO} any line in a prompt file which starts with ${chalk.bold.green("::code")} is a "code reference directive":`)
    log(`        ${INFO2} an example usage would be: ${chalk.bold.green("::code Dictionary.ts, Data.json")}`)
    log(`        ${INFO2} using this example, the filenames ${chalk.bold.blue("Dictionary.ts")} and ${chalk.bold.blue("Data.json")} will be searched`)
    log(`          for in the ${chalk.italic("code path")}; where the "code path" is by default the following:`)
    log(`               - "${chalk.blueBright(`\${${chalk.yellow("ProjRoot")}}/src`)}"`)
    log(`               - "${chalk.blueBright(`\${${chalk.yellow("ProjRoot")}}/test`)}"`)
    log(`               - "${chalk.blueBright(`\${${chalk.yellow("ProjRoot")}}/tests`)}"`)
    log(`        ${INFO2} by setting the ${chalk.bold.blue("codePath")} variable in a repo's ${chalk.blue.bold(".prompt.json")} file you can`);
    log(`          override this to whatever you want`)
    log(`     ${INFO} in addition to ${chalk.italic("code")} references there are also ${chalk.bold("web")} and ${chalk.bold("doc")} references:`)
    log(`        ${INFO2} a ${chalk.bold("web")} reference brings in a summary for a webpage`);
    log(`        ${INFO2} a ${chalk.bold("doc")} reference allows the injection of ${chalk.italic("sub-contextual")} information and`)
    log(`          allows for more granular reuse patterns`)
    log(`    ${INFO} see the ${link(chalk.bold.blue.underline("docs"), `https://github.com/yankeeinlondon/promptly/README.md`)} for more info on these reference types`)

    log();
    log(`- ${chalk.bold("CLI Flags")}`)
    log();
    log(`    ${INFO} ${chalk.bgGrey.whiteBright(` --output ${chalk.dim("<filename>")} `)}, ${chalk.bgGrey.whiteBright(` -o ${chalk.dim("<filename>")} `)}`)
    log(`        ${INFO2} every successful run of the CLI puts the ${chalk.italic("interpolated")} prompt on the clipboard`)
    log(`        ${INFO2} by having it on the clipboard it becomes easy to copy it into open chat`)
    log(`          windows ${chalk.italic.dim("(if that's how you role)")}`)
    log(`        ${INFO2} but using this flag allows you to export it to a local file if you prefer`)

    log(`    ${INFO} ${chalk.bgGrey.whiteBright(` --replace `)}`)
    log(`        ${INFO2} similar to the --output flag but instead of providing a file name, it will ${chalk.italic("replace")}`)
    log(`          the input prompt templates with ${chalk.italic("interpolated")} versions of themselves`)

    log(`    ${INFO} ${chalk.bgGrey.whiteBright(" --aider ")}`)
    log(`        ${INFO2} this CLI can be used as a ${chalk.italic("frontend")} for ${link(chalk.bold.blue("Aider"), "https://aider.org")}`)
    log(`        ${INFO2} when this flag is used the ${chalk.bold("web")} and ${chalk.bold("file")} interpolations normally done will instead`)
    log(`          be converted into ${chalk.blue.bold("/add")} and ${chalk.blue.bold("/web")} commands and the Prompt along with these commands`)
    log(`          will be streamed into aider and processed there`)

    log(`    ${INFO} ${chalk.bgGrey.whiteBright(" --dry-run ")}`)
    log(`        ${INFO2} prevents the references found in Prompt files from being interpolated into the prompts`)
    log(`        ${INFO2} instead it just reports on the structure of the prompt `)
    log(`        ${INFO2} useful way to quickly check that your CLI command is structurally sound`)
}
