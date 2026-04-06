export async function loadPeopleIndex() {
  const res = await fetch("data/people.json", { cache: "no-store" });
  if (!res.ok) throw new Error("无法读取 people.json");
  return res.json();
}

export function avatarSrc(avatar) {
  if (avatar && typeof avatar === "string") return avatar;
  return "assets/images/default-avatar.svg";
}

export function cardTemplate(person) {
  const tags = (person.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  return `
    <a class="card" href="person.html?id=${encodeURIComponent(person.id)}">
      <img class="card-avatar" src="${escapeHtml(avatarSrc(person.avatar))}" alt="${escapeHtml(person.name)} 头像" loading="lazy" onerror="this.src='assets/images/default-avatar.svg'" />
      <h3>${escapeHtml(person.name)}</h3>
      <p>${escapeHtml(person.summary || "暂无简介")}</p>
      <p class="meta">机构: ${escapeHtml(person.organization || "未标注")} · 更新: ${escapeHtml(person.updated || "未知")}</p>
      <div class="tags">${tags}</div>
    </a>
  `;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseFrontMatter(markdown) {
  const matched = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!matched) return { meta: {}, content: markdown };

  const [, rawMeta, content] = matched;
  const meta = {};
  rawMeta.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) return;

    if (value.startsWith("[") && value.endsWith("]")) {
      meta[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return;
    }
    meta[key] = value;
  });

  return { meta, content };
}
