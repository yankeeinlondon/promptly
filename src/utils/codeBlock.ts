import { stripLeading } from "inferred-types";
import { basename, extname } from "pathe";

export function codeBlock(text: string, filename: string) {
  return `
##### ${basename(filename)}

\`\`\`${stripLeading(extname(filename), ".")}
${text.trim()}
\`\`\`

`;
}
