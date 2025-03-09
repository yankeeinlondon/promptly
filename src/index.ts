#!/usr/bin/env bun run 

import { argv, exit } from "node:process";
import { createPrompt } from "./createPrompt";
import { help } from "./help";
import { envReport } from "./envReport";
import { configSwitches } from "./utils/configSwitches";

const { args, switches } = configSwitches(argv,{
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

export type Switches = typeof switches;


// Main CLI logic
async function main() {


    // const args = argv.slice(2).filter(i => !i.startsWith(`-`));
    // const switches = argv.slice(2).filter(i => i.startsWith(`-`));
   

    if (switches.env) {
        await envReport();
        exit(0);
    }

    if (args.length === 0 || switches.help) {
        help();
        exit(0);
    }

    return await createPrompt(args, switches);
}

await main();
