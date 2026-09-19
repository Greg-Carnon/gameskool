/**
 * Wochen-Highscore für Pissoir. Braucht einen KV-Store (Upstash Redis über den Vercel Marketplace)
 * mit den Umgebungsvariablen KV_REST_API_URL und KV_REST_API_TOKEN. Ohne Store antwortet die API 503
 * und das Spiel blendet das Board aus.
 */
export const config = { runtime: 'edge' };

const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

function weekKey(): string {
  const d = new Date();
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getUTCDay() + 1) / 7);
  return `pissoir:week:${d.getUTCFullYear()}-${week}`;
}

async function redis(cmd: unknown[]): Promise<unknown> {
  const r = await fetch(URL_!, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = (await r.json()) as { result?: unknown; error?: string };
  if (j.error) throw new Error(j.error);
  return j.result;
}

export default async function handler(req: Request): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (!URL_ || !TOKEN) return new Response(JSON.stringify({ error: 'no store' }), { status: 503, headers });
  const key = weekKey();
  if (req.method === 'POST') {
    let body: { name?: string; score?: number };
    try { body = (await req.json()) as typeof body; } catch { return new Response('bad json', { status: 400 }); }
    const name = String(body.name ?? '').replace(/[^\w\- ]/g, '').trim().slice(0, 14) || 'anon';
    const score = Math.max(0, Math.min(999999, Math.floor(Number(body.score) || 0)));
    if (score === 0) return new Response('{}', { headers });
    const member = `${name}#${Math.random().toString(36).slice(2, 6)}`;
    await redis(['ZADD', key, score, member]);
    await redis(['EXPIRE', key, 60 * 60 * 24 * 21]);
    await redis(['ZREMRANGEBYRANK', key, 0, -101]);
  }
  const raw = (await redis(['ZREVRANGE', key, 0, 9, 'WITHSCORES'])) as string[];
  const top: { name: string; score: number }[] = [];
  for (let i = 0; i < raw.length; i += 2) top.push({ name: raw[i].split('#')[0], score: Number(raw[i + 1]) });
  return new Response(JSON.stringify({ week: key.split(':').pop(), top }), { headers });
}
