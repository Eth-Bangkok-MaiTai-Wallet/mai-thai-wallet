
import { kv } from "@vercel/kv";

interface Segment {
    text: string,
    speaker: string,
    speaker_id: number,
    is_user: boolean,
    person_id: number,
    start: number,
    end: number
}

interface Message {
    role: string, 
    content: string
}

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

function groupSegmentsIntoIntents(segments: Segment[], timeWindow: number = 5): Message[] {
    const sentences: Message[] = [];
    let currentSentence: string[] = [];
    let lastStartTime: number = -Infinity;

    for (const segment of segments) {
        // If this segment is within the time window of the last segment
        if (segment.start - lastStartTime <= timeWindow) {
            currentSentence.push(segment.text);
        } else {
            // If we have segments in the current sentence, join them and add to sentences
            if (currentSentence.length > 0) {
                sentences.push({
                    role: 'user',
                    content: currentSentence.join(' ')
                })
            }
            // Start a new sentence
            currentSentence = [segment.text];
        }
        lastStartTime = segment.start;
    }

    // Don't forget to add the last sentence
    if (currentSentence.length > 0) {
        sentences.push({
            role: 'user',
            content: currentSentence.join(' ')
        })
    }


    return sentences;
}

export async function GET() {
    //const { userId, sessionId } = await req.json(); // Assuming userId and sessionId are sent in the request body
    const key = "intent"; // userId.toString().concat(sessionId)

    const segments: Segment[] | null = await kv.get(key);

    if(!segments){
        return new Response(JSON.stringify([]), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    
    const intents = groupSegmentsIntoIntents(segments);

    return new Response(JSON.stringify(intents), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
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