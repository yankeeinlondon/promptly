import type { Uri } from "inferred-types";
import type { Switches } from "..";
import type { HttpHeaders } from "~/types";
import { writeFileSync } from "node:fs";
import { cwd } from "node:process";
import { Browser } from "happy-dom";
import { ensureLeading } from "inferred-types";
import { join } from "pathe";
import { IGNORE_INVALID_CERT } from "~/constants";
import { BrowserError } from "~/errors";
import { success } from "~/utils";
import { htmlToMd } from "./htmlToMd";

export interface GetPageOptions {
  bearerToken?: string;
  apiKey?: { key: string; value: string };
}

export async function getPage(
  uri: Uri<"http" | "https">,
  s: Switches,
  opt?: GetPageOptions,
) {
  const headers: HttpHeaders = {
    "Accept": "*/*",
    "UserAgent": "curl/7.64.1",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    ...(
      opt?.bearerToken
        ? { Authorization: ensureLeading(opt.bearerToken, "Bearer ") }
        : {}
    ),
  };

  const req = await fetch(uri, { method: "GET", headers: headers as any });

  const browser = new Browser();
  const page = browser.newPage();
  performance.mark("start");
  const resp = await page
    .goto(uri);

  if (!resp) {
    return new BrowserError(`Unable to get a response from "${uri}"`);
  }

  const _code: number = resp.status;
  const _statusText: string = resp?.statusText;

  if (req?.ok) {
    // const page = await req.text();

    if (s.verbose) {
      performance.mark("loaded");
      // const loading = performance.measure("loadingTime", "start", "loaded")
      success(`the page "${uri}" was loaded successfully; now waiting for scripts to complete`);
    }

    await page.waitUntilComplete();
    performance.mark("end");

    performance.measure("load-page", "start", "loaded");
    performance.measure("load-to-ready", "loaded", "end");
    performance.measure("total", "start", "end");

    const _measurements = [
      "load-page",
      "load-to-ready",
      "total",
    ].map(i => performance.getEntriesByName(i));
    if (s.verbose) {
      success(`page has completed loading`);
    }

    const main = page.mainFrame.content;
    writeFileSync(join(cwd(), "/example.github.html"), main, "utf-8");

    const md = await htmlToMd(page);
    if (s.verbose) {
      success(`page converted to markdown`);
    }
    writeFileSync(join(cwd(), "/md.md"), md);
  }

  if (IGNORE_INVALID_CERT) {
    // TODO
  }

  browser.close();
}
