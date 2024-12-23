import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
        return new NextResponse(JSON.stringify({ error: 'Missing key parameter' }), { status: 400 });
    }

    const res = await kv.get(key);

    console.log('Key:', key);
    console.log('Value:', res);

    return new NextResponse(JSON.stringify({ data: res }), { status: 200 });
}