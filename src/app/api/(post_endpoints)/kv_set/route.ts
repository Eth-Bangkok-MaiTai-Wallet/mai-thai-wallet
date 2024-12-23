import { kv } from "@vercel/kv";

export async function POST(req: Request) {
    const { key, value } = await req.json();

    console.log('KvSet Key:', key);
    console.log('KvSet Value:', value);

    await kv.set(key, value);

    const res = await kv.get(key);

    return new Response(JSON.stringify({ success: true, data: res }), { status: 201 });
}