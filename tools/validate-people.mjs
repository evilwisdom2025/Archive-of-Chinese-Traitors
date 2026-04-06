#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PEOPLE_DIR = path.join(ROOT, "data", "people");

function parseFrontMatter(markdown) {
  const matched = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!matched) return { meta: null, content: markdown };

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

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

function firstParagraph(content) {
  const lines = content
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith("#") && !s.startsWith("- ") && !/^\d+\./.test(s));
  return lines[0] || "";
}

async function main() {
  const files = (await fs.readdir(PEOPLE_DIR)).filter((f) => f.endsWith(".md"));
  const issues = [];

  for (const file of files) {
    const full = path.join(PEOPLE_DIR, file);
    const raw = await fs.readFile(full, "utf8");
    const { meta, content } = parseFrontMatter(raw);
    const label = `data/people/${file}`;

    if (!meta) {
      issues.push(`${label}: missing front matter block`);
      continue;
    }

    const requiredText = ["name", "organization", "updated"];
    for (const key of requiredText) {
      if (!meta[key] || !String(meta[key]).trim()) {
        issues.push(`${label}: missing required field '${key}'`);
      }
    }

    if (!Array.isArray(meta.tags) || meta.tags.length === 0) {
      issues.push(`${label}: field 'tags' must be a non-empty array like [标签1, 标签2]`);
    }

    if (!meta.avatar || !String(meta.avatar).trim()) {
      issues.push(`${label}: missing required field 'avatar' (e.g. data/avatars/xxx.jpg)`);
    } else {
      const avatarPath = String(meta.avatar).trim();
      if (!avatarPath.startsWith("data/avatars/")) {
        issues.push(`${label}: avatar must be inside data/avatars/`);
      } else {
        const absAvatar = path.join(ROOT, avatarPath);
        try {
          const stat = await fs.stat(absAvatar);
          if (!stat.isFile()) issues.push(`${label}: avatar path is not a file -> ${avatarPath}`);
        } catch {
          issues.push(`${label}: avatar file not found -> ${avatarPath}`);
        }
      }
    }

    if (meta.updated && !isValidDate(meta.updated)) {
      issues.push(`${label}: field 'updated' must be YYYY-MM-DD`);
    }

    const paragraph = firstParagraph(content);
    if (!paragraph) {
      issues.push(`${label}: body is empty`);
    }

    const hasEvidenceHeading = /##\s*证据与来源/.test(content);
    if (!hasEvidenceHeading) {
      issues.push(`${label}: missing section heading '## 证据与来源'`);
    }

    const hasLink = /\[[^\]]+\]\(https?:\/\//.test(content);
    if (!hasLink) {
      issues.push(`${label}: should include at least one http/https source link`);
    }
  }

  if (issues.length) {
    console.error("Validation failed:\n");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`Validation passed for ${files.length} markdown files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
