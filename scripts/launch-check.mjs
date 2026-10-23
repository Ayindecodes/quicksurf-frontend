// Fails while any business detail is still a placeholder (see src/content/business.ts).
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/content/business.ts", import.meta.url), "utf8");
const missing = [...source.matchAll(/^\s*(\w+): todo\(/gm)].map((match) => match[1]);
if (!/legalReviewed: true/.test(source)) missing.push("legalReviewed (have a lawyer review /terms, /privacy and /refunds)");

if (missing.length) {
  console.error(`Not ready to launch. Fill in these business details in src/content/business.ts:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}
console.log("Business details are complete.");
