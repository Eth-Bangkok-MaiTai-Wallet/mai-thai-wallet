import { Segment } from "@/lib/utils";
import { kv } from "@vercel/kv";

interface Message {
    role: string, 
    content: string
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
    const testSegments: Segment[] = [
        { start: 0, end: 1, text: "I", speaker: "Speaker1", speaker_id: 1, is_user: true, person_id: 1 },
        { start: 2, end: 3, text: "want to", speaker: "Speaker1", speaker_id: 1, is_user: true, person_id: 1 },
        { start: 4, end: 5, text: "send 0.0001 eth", speaker: "Speaker1", speaker_id: 1, is_user: true, person_id: 1 },
        { start: 6, end: 7, text: "to vitalik.eth", speaker: "Speaker1", speaker_id: 1, is_user: true, person_id: 1 },
        // { start: 12, end: 13, text: "I", speaker: "Speaker1", speaker_id: 1, is_user: true, person_id: 1 },
    ];

    const testIntents = groupSegmentsIntoIntents(testSegments);

    console.log("Test Intents:", testIntents);
    //const { userId, sessionId } = await req.json(); // Assuming userId and sessionId are sent in the request body
    // const key = "intent"; // userId.toString().concat(sessionId)

    // const segments: Segment[] | null = await kv.get(key);

    // if(!segments){
    //     return new Response(JSON.stringify([]), {
    //         status: 404,
    //         headers: { 'Content-Type': 'application/json' },
    //     })
    // }
    
    // const intents = groupSegmentsIntoIntents(segments);

    return new Response(JSON.stringify(testIntents), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}