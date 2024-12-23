import { kv } from "@vercel/kv";

export async function POST(req: Request) {
    const { key, value } = await req.json();

    await kv.set(key, value);

    const res = await kv.get(key);

    return new Response(JSON.stringify({ success: true, data: res }), { status: 201 });
}