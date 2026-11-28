// Fyller /stats/ med sju dagars räknare.
const day = (offset) => new Date(Date.now() - offset * 864e5).toISOString().slice(0, 10);
const tbody = document.querySelector("#t tbody");

for (let i = 0; i < 7; i++) {
  const d = day(i);
  tbody.insertAdjacentHTML("beforeend", `<tr data-day="${d}"><td style="padding:6px 8px;border-bottom:1px solid #eee">${d}</td><td colspan="2" style="padding:6px 8px;color:#888">loading…</td></tr>`);
  try {
    const r = await fetch(`/e?day=${d}`, { cache: "no-store" });
    const rows = Object.entries((await r.json()).counts || {}).sort((a, b) => b[1] - a[1]);
    const tr = tbody.querySelector(`tr[data-day="${d}"]`);
    tr.innerHTML = `<td style="padding:6px 8px;border-bottom:1px solid #eee">${d}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${rows.length ? "" : "—"}</td><td style="padding:6px 8px;border-bottom:1px solid #eee"></td>`;
    const cells = tr.children;
    if (!rows.length) { cells[1].textContent = "no events"; cells[2].remove(); continue; }
    cells[1].innerHTML = rows.map(([k, v]) => `<div>${k}</div>`).join("");
    cells[2].style.textAlign = "right";
    cells[2].innerHTML = rows.map(([, v]) => `<div>${v}</div>`).join("");
  } catch {
    tbody.querySelector(`tr[data-day="${d}"]`)?.lastElementChild?.replaceChildren("error");
  }
}
