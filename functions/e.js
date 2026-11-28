// Eventräknare: POST /e?ev=<namn>  → räknar upp KV. Svarar alltid 204 snabbt.
export async function onRequestPost({ request, env }) {
  const ev = new URL(request.url).searchParams.get("ev") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  if (env.COUNTS) {
    const key = `${day}:${ev}`;
    try {
      const cur = Number((await env.COUNTS.get(key)) || 0);
      await env.COUNTS.put(key, String(cur + 1));
    } catch {}
  }
  return new Response(null, { status: 204 });
}

export async function onRequestGet({ request, env }) {
  const day = new URL(request.url).searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const out = {};
  if (env.COUNTS) {
    const list = await env.COUNTS.list({ prefix: day + ":" });
    for (const k of list.keys) out[k.name.slice(day.length + 1)] = Number((await env.COUNTS.get(k.name)) || 0);
  }
  return Response.json({ day, counts: out });
}
