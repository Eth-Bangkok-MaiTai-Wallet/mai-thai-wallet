import { kv } from "@vercel/kv";

export async function GET(key: string) {

    const res = await kv.get(key);

    return new Response(JSON.stringify({ data: res }), { status: 200 });
}