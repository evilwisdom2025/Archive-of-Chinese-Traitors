import { loadPeopleIndex, parseFrontMatter, escapeHtml, avatarSrc } from "./common.js";

const nameEl = document.getElementById("person-name");
const metaEl = document.getElementById("person-meta");
const contentEl = document.getElementById("person-content");
const avatarEl = document.getElementById("person-avatar");

function getId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("id");
}

(async function init() {
  try {
    const id = getId();
    if (!id) throw new Error("缺少 id 参数");

    const people = await loadPeopleIndex();
    const person = people.find((item) => item.id === id);
    if (!person) throw new Error("未找到该人物");

    const res = await fetch(person.markdown, { cache: "no-store" });
    if (!res.ok) throw new Error("人物 Markdown 加载失败");

    const rawMarkdown = await res.text();
    const { meta, content } = parseFrontMatter(rawMarkdown);

    const displayName = meta.name || person.name;
    const displayOrg = meta.organization || person.organization || "未标注机构";
    const updated = meta.updated || person.updated || "未知";
    const avatar = meta.avatar || person.avatar;

    nameEl.textContent = displayName;
    metaEl.textContent = `机构: ${displayOrg} · 最近更新: ${updated}`;
    avatarEl.src = avatarSrc(avatar);
    avatarEl.alt = `${displayName} 头像`;
    avatarEl.onerror = () => {
      avatarEl.src = "assets/images/default-avatar.svg";
    };

    const html = window.marked.parse(content);
    contentEl.innerHTML = html;
  } catch (error) {
    nameEl.textContent = "加载失败";
    metaEl.textContent = escapeHtml(error.message);
    avatarEl.src = "assets/images/default-avatar.svg";
    contentEl.innerHTML = "";
  }
})();
