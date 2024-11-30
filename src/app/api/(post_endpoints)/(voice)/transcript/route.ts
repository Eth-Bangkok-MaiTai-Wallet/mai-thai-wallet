
import { Segment } from "@/lib/utils";
import { kv } from "@vercel/kv";

/**
 * @description Appends new segments to vercel KV database
 * @param userId 
 * @param sessionId 
 * @param segments 
 */
async function appendToTranscript(userId: string, sessionId: string, newSegments: Array<Segment>) {
    const key = "intent"//userId.toString().concat(sessionId)

    let segments: Segment[] | null = await kv.get(key);
    if(!segments){
        segments = []
    }else {
        segments = [...segments, ...newSegments]
    }
    
    //sort segments based on start field
    segments.sort((a, b) => a.start - b.start);
    //store updated segment array to db
    await kv.set(key, segments);

    console.log("Updated segments: ", segments)
}

export async function POST(req: Request) {
    const payload = await req.json();
    console.log("Payload: ", payload)
    const segments = payload.segments
    const userId = payload.segments[0].speaker_id
    const sessionId = payload.session_id
    
    appendToTranscript(userId, sessionId, segments)

    return new Response(payload, { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}