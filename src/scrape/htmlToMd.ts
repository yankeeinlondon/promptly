import type { BrowserPage } from "happy-dom";
import { isString } from "inferred-types";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { log } from "~/utils";

/**
 * Receives HTML content and from that determines:
 *
 * 1. the best DOM query to remove unnecessary clutter
 */
export async function htmlToMd(page: BrowserPage | string) {
  if (!isString(page)) {
    const doc = page.mainFrame.document;
    const body = doc.body.outerHTML;
    const md = await unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .process(body);

    log("markdown conversion", {
      messages: md.messages,
      htmlLength: body.length,
      raw: doc.body.textContent,
    });

    return String(md);
  }
  else {
    const md = await unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkStringify)
      .process(page);

    return String(md);
  }
}
