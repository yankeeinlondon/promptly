import findRoot from "find-root";
import "dotenv/config"
import { cwd } from "node:process";
import { join } from "pathe";
import { existsSync, readFileSync } from "node:fs";
import { createKindError } from "@yankeeinlondon/kind-error";
import chalk from "chalk";
import { isConfigFile } from "./type-guards";
import { ConfigFile } from "./types";
import { fail, success } from "./utils";
import { isTruthy } from "inferred-types/runtime";


export const IGNORE_INVALID_CERT: boolean = isTruthy(process.env.IGNORE_INVALID_CERT)
    ? true
    : false;

export const EXT_TO_LANG = {
    "cpp": "cpp",
    "c": "c",
    "ts": "ts",
    "js": "js",
    "py": "py",
    "sh": "sh",
    "bash": "bash",
    "php": "php",
    "rs": "rust",
    "json": "json",
    "txt": "txt",
    "toml": "toml",
    "yaml": "yaml",
    "yml": "yaml",
    "md": "md",
    "lua": "lua",
    "": "text",
} as const

export const ROOT = findRoot(cwd()) || cwd();

export const CONFIG_FILE = join(ROOT, "/.prompt.json");

const InvalidConfig = createKindError(
    "InvalidConfig"
)
let _CONFIG: ConfigFile | undefined;

if (existsSync(CONFIG_FILE)) {
    try {
        const data = readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(data);
        if(isConfigFile(parsed)) {
            success(`using the config file at ${chalk.blue(CONFIG_FILE)}`)
            _CONFIG = parsed;
        } else {
            _CONFIG = undefined;
            fail(`a config file was found at ${chalk.blue(CONFIG_FILE)} and was ${chalk.italic("parsed")} but appears to be of the wrong format.`)
        }
    } catch (err) {
        _CONFIG = undefined;
        fail(`a config file was found at ${chalk.blue(CONFIG_FILE)} but it could not be parsed into a configuration file!\n`)
    }

}


export const CONFIG = _CONFIG;

/**
 * The directories to look for **prompt** files in
 */
export const PROMPTS_DIR = [
    ...(
        CONFIG
        ? CONFIG.promptDirs ? CONFIG.promptDirs : [`${ROOT}/prompts`]
        : [`${ROOT}/prompts`]
    ),
    ...(
        process.env.PROMPTS
            ? process.env.PROMPTS.split(":")
            : []
    )
] as const;

export const PROMPTS_GLOB = PROMPTS_DIR.map(i => join(i, `/**/*.(md|txt)`));

export const CODE_PATHS = [
    ...(
        CONFIG && CONFIG.codePath
            ? CONFIG.codePath
            : [
                `${ROOT}/src`,
                `${ROOT}/test`,
                `${ROOT}/tests`,
            ]
    ),
    ...(
        process.env.CODE
            ? process.env.CODE.split(":")
            : []
    )
]
