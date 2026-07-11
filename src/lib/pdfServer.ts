import { createServerFn } from "@tanstack/react-start";
import { existsSync } from "node:fs";

type RenderPdfInput = { html: string; landscape: boolean };

const LOCAL_CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((p): p is string => !!p);

/** Shared by every PDF-producing server function below — launches headless
 * Chromium and renders `html` to raw PDF bytes. Not exported: callers only
 * ever want one of the two response shapes below (Blob for download/share,
 * base64 for the WhatsApp send), never these raw bytes directly. */
async function renderPdfBuffer(html: string, landscape: boolean): Promise<Buffer> {
  const chromium = (await import("@sparticuz/chromium")).default;
  const { launch } = await import("puppeteer-core");

  // On Vercel/Lambda there's no system browser, so we ship a
  // Linux-compatible Chromium binary via @sparticuz/chromium. Locally
  // (Windows/Mac dev machines) that binary can't run — fall back to
  // whatever desktop Chrome/Edge is already installed.
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const localChrome = LOCAL_CHROME_CANDIDATES.find((p) => existsSync(p));
  const executablePath =
    isServerless || !localChrome ? await chromium.executablePath() : localChrome;

  const browser = await launch({
    args: isServerless || !localChrome ? chromium.args : [],
    executablePath,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "a4",
      landscape,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

const validateRenderInput = (data: unknown): RenderPdfInput => {
  const d = data as Partial<RenderPdfInput>;
  if (typeof d?.html !== "string" || !d.html) throw new Error("html is required");
  return { html: d.html, landscape: !!d.landscape };
};

/** Renders a self-contained HTML document (markup + inlined CSS, no scripts)
 * to a real vector PDF using headless Chromium — the same rendering engine
 * and print CSS the "Print" button already uses, so text stays crisp at any
 * zoom instead of being a raster screenshot. */
export const renderPdfServerFn = createServerFn({ method: "POST" })
  .validator(validateRenderInput)
  .handler(async ({ data }) => {
    const pdf = await renderPdfBuffer(data.html, data.landscape);
    return new Response(new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), {
      headers: { "Content-Type": "application/pdf" },
    });
  });

/** Same rendering as renderPdfServerFn, but returns base64 JSON instead of a
 * Blob Response — for callers that need to hand the bytes to another server
 * (e.g. the WhatsApp send service), which can't consume a fetch Response. */
export const renderPdfBase64ServerFn = createServerFn({ method: "POST" })
  .validator(validateRenderInput)
  .handler(async ({ data }) => {
    const pdf = await renderPdfBuffer(data.html, data.landscape);
    return { pdfBase64: pdf.toString("base64") };
  });
