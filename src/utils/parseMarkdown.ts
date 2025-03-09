import type { Frontmatter } from "~/types";

type ParsedMarkdown = [
    fm: Frontmatter,
    content: string,
];

/**
 * Splits out the frontmatter from the markdown prose
 */
export function parseMarkdown(fileContent: string): ParsedMarkdown {
  if (fileContent.startsWith("---")) {
    // Find the closing delimiter; start searching after the first '---'
    const endOfFrontmatter = fileContent.indexOf("---", 3);
    if (endOfFrontmatter !== -1) {
      // Extract the frontmatter content (skip the initial and ending '---')
      const frontMatterContent = fileContent.substring(3, endOfFrontmatter).trim();
      // The rest of the file is the markdown content
      const content = fileContent.substring(endOfFrontmatter + 3).trim();

      // Parse the frontmatter lines into a key/value object
      const frontMatter: Record<string, string> = {};
      const lines = frontMatterContent.split("\n");
      for (const line of lines) {
        // Expect lines of the form "key: value"
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

  // If no frontmatter is found, return an empty object for frontmatter and the full file as content.
  return [{}, fileContent];
}
