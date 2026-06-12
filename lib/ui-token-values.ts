import { readFileSync } from "node:fs";
import { join } from "node:path";

type ColorToken =
  | "text-dark"
  | "text-darkest"
  | "text-primary"
  | "text-secondary";

let cachedColorTokens: Partial<Record<ColorToken, string>> | null = null;

function readColorTokens(): Partial<Record<ColorToken, string>> {
  if (cachedColorTokens) {
    return cachedColorTokens;
  }

  const globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  const tokens: Partial<Record<ColorToken, string>> = {};
  const colorTokenPattern = /--color-([a-z0-9-]+):\s*([^;]+);/g;

  for (const match of globalsCss.matchAll(colorTokenPattern)) {
    const tokenName = match[1] as ColorToken;
    const tokenValue = match[2]?.trim();

    if (tokenValue) {
      tokens[tokenName] = tokenValue;
    }
  }

  cachedColorTokens = tokens;
  return tokens;
}

export function getColorTokenValue(token: ColorToken): string {
  const value = readColorTokens()[token];

  if (!value) {
    throw new Error(`Missing UI color token: ${token}`);
  }

  return value;
}
