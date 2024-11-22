import { clusters } from "@/lib/classification";
import { classify, EmbeddingSimilarityClassifier, openai } from "modelfusion";

const classifier = new EmbeddingSimilarityClassifier({
    embeddingModel: openai.TextEmbedder({
      model: "text-embedding-ada-002",
    }),
    similarityThreshold: 0.82,
    clusters: clusters
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log(messages);
  
    const result = await classify({
        model: classifier,
        value: messages[messages.length - 1].content,
    });

    console.log(result);

    return new Response(JSON.stringify(result), { 
      status: result ? 200 : 204,
      headers: { 'Content-Type': 'application/json' },
    });
}