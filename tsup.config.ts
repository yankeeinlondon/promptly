import type { Format } from "tsup";
import { defineConfig } from "tsup";

function config(format: Format) {
    return defineConfig({
        entry: ["src/index.ts"],
        format: "esm",
        dts: false,
        sourcemap: true,
        clean: true,
        outDir: "./bin",
        outExtension: ()  => ({ js: ".js", dts: ".ts"}),
        // outExtension: ({ format }) => {
        //     return {
        //         js: format === "cjs" ? ".cjs" : ".js",
        //         dts: ".ts",
        //     };
        // },
        tsconfig: "./tsconfig.json",
    });
}

export default config;
