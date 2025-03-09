import { isObject } from "inferred-types";
import { ConfigFile } from "./types";

const CONFIG_PROPS = [
    "promptDirs",
    "codePath",
    "docPath"
]

export function isConfigFile(val: unknown): val is ConfigFile {
    return isObject(val) && Object.keys(val).every(i => CONFIG_PROPS.includes(i))
}
