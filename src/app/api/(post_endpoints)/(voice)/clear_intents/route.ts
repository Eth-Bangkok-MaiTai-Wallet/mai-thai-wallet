
import { kv } from "@vercel/kv";

export async function POST() {
    await kv.del("intent");

    return new Response(null,{ 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}