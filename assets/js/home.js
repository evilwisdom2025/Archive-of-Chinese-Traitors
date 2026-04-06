import { loadPeopleIndex, cardTemplate } from "./common.js";

const target = document.getElementById("latest-cards");
const statsEl = document.getElementById("stats");

function sortPeople(list) {
  return list
    .slice()
    .sort((a, b) => {
      const pinnedDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinnedDiff !== 0) return pinnedDiff;
      return new Date(b.updated || 0) - new Date(a.updated || 0);
    });
}

(async function init() {
  try {
    const people = await loadPeopleIndex();
    const sorted = sortPeople(people).slice(0, 6);

    const total = people.length;
    const tags = new Set(people.flatMap((p) => p.tags || [])).size;
    const orgs = new Set(people.map((p) => p.organization).filter(Boolean)).size;
    statsEl.innerHTML = `
      <div class="stat"><span>总条目</span><strong>${total}</strong></div>
      <div class="stat"><span>覆盖标签</span><strong>${tags}</strong></div>
      <div class="stat"><span>涉及机构</span><strong>${orgs}</strong></div>
    `;

    sorted.forEach((p) => {
      target.insertAdjacentHTML("beforeend", cardTemplate(p));
    });
  } catch (error) {
    target.innerHTML = `<p>加载失败：${error.message}</p>`;
    statsEl.innerHTML = "";
  }
})();
