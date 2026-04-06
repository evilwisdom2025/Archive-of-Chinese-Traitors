import { loadPeopleIndex, cardTemplate } from "./common.js";

const target = document.getElementById("people-cards");
const searchInput = document.getElementById("search-input");
let source = [];

function sortPeople(list) {
  return list
    .slice()
    .sort((a, b) => {
      const pinnedDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinnedDiff !== 0) return pinnedDiff;
      return new Date(b.updated || 0) - new Date(a.updated || 0);
    });
}

function render(list) {
  target.innerHTML = "";
  if (!list.length) {
    target.innerHTML = "<p>未找到匹配条目。</p>";
    return;
  }
  sortPeople(list).forEach((item) => target.insertAdjacentHTML("beforeend", cardTemplate(item)));
}

(async function init() {
  try {
    source = await loadPeopleIndex();
    render(source);
  } catch (error) {
    target.innerHTML = `<p>加载失败：${error.message}</p>`;
  }
})();

searchInput.addEventListener("input", (event) => {
  const q = event.target.value.trim().toLowerCase();
  if (!q) {
    render(source);
    return;
  }

  const filtered = source.filter((p) => {
    const pool = [p.name, p.alias, p.organization, p.summary, ...(p.tags || [])]
      .filter(Boolean)
      .join("|")
      .toLowerCase();
    return pool.includes(q);
  });

  render(filtered);
});
