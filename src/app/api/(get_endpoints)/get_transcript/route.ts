import { Segment } from "@/lib/utils";
import { kv } from "@vercel/kv";

interface Message {
    role: string, 
    content: string
}

export function groupSegmentsIntoIntents(segments: Segment[], timeWindow: number = 5): Message[] {
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