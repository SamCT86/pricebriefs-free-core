// Mätning: sidvisning och klick på de fyra vägarna. Ingen cookie, inget id.
const send = (ev) => {
  const url = `/e?ev=${encodeURIComponent(ev)}`;
  if (navigator.sendBeacon) navigator.sendBeacon(url);
  else fetch(url, { method: "POST", keepalive: true }).catch(() => {});
};

const page = location.pathname.replace(/\/$/, "") || "/";
send("view:" + page);

const map = [
  ['a[href="/app/"]', "cta:app"],
  ['a[href="/request/"]', "cta:request"],
  ["#fill-fictional-example", "cta:example"],
  ["#check", "cta:check"],
  ["#review-csv", "cta:csv"],
];
for (const [sel, ev] of map) {
  document.querySelectorAll(sel).forEach((el) => el.addEventListener("click", () => send(ev), { passive: true }));
}
