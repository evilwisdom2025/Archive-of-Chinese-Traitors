#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PEOPLE_DIR = path.join(ROOT, "data", "people");
const OUTPUT = path.join(ROOT, "data", "people.json");

function slugToName(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");
}

function parseFrontMatter(markdown) {
  const matched = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!matched) return { meta: {}, content: markdown };

  const [, rawMeta, content] = matched;
  const meta = {};

  for (const line of rawMeta.split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;

    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      meta[key] = value;
    }
  }

  return { meta, content };
}

function extractSummary(content) {
  const lines = content
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith("#") && !s.startsWith("- ") && !/^\d+\./.test(s));

  const first = lines[0] || "暂无简介";
  return first.length > 90 ? `${first.slice(0, 90)}...` : first;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string" && tags.trim()) return [tags.trim()];
  return [];
}

function normalizePinned(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return false;
}

async function main() {
  const files = (await fs.readdir(PEOPLE_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  const people = [];

  for (const file of files) {
    const id = file.replace(/\.md$/i, "");
    const fullPath = path.join(PEOPLE_DIR, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const { meta, content } = parseFrontMatter(raw);

    people.push({
      id,
      name: meta.name || slugToName(id),
      alias: meta.alias || "",
      organization: meta.organization || "",
      avatar: meta.avatar || "",
      pinned: normalizePinned(meta.pinned),
      summary: extractSummary(content),
      tags: normalizeTags(meta.tags),
      updated: meta.updated || "",
      markdown: `data/people/${file}`
    });
  }

  await fs.writeFile(OUTPUT, `${JSON.stringify(people, null, 2)}\n`, "utf8");
  console.log(`Generated ${people.length} records -> ${path.relative(ROOT, OUTPUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
