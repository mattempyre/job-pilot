import path from "node:path";

import { PDFParse } from "pdf-parse";

const MAX_RESUME_TEXT_LENGTH = 24000;
const PDF_PARSE_WORKER_PATH = path.join(
  process.cwd(),
  "node_modules/pdf-parse/dist/worker/pdf.worker.mjs",
);

let isPdfWorkerConfigured = false;

function configurePdfWorker(): void {
  if (isPdfWorkerConfigured) {
    return;
  }

  PDFParse.setWorker(PDF_PARSE_WORKER_PATH);
  isPdfWorkerConfigured = true;
}

function trimResumeText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_RESUME_TEXT_LENGTH);
}

export async function extractPdfTextFromBuffer(
  buffer: Buffer,
): Promise<string> {
  configurePdfWorker();

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return trimResumeText(result.text);
  } finally {
    await parser.destroy();
  }
}

export async function extractPdfTextFromBlob(blob: Blob): Promise<string> {
  return extractPdfTextFromBuffer(Buffer.from(await blob.arrayBuffer()));
}
