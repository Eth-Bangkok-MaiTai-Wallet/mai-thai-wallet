import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { executeLitAction } from '@/lib/tools/executeLitAction';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log("----Transaction----:", messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
            lit_action: tool({
              description: 'A tool for calculating sum of numbers.',
              parameters: z.object({number1: z.string(), number2: z.string()}),
              execute: async ({number1, number2}) => executeLitAction(number1, number2)
            }),
		},
        maxSteps: 5,
		toolChoice: 'required',
        system:
          	'You are calculating sum of the numbers',
        prompt:
          JSON.stringify(messages),
    });
      
    console.log(`FINAL TOOL CALLS: ${JSON.stringify(toolCalls, null, 2)}`);

    console.log(`STEPS RESPONSE: ${JSON.stringify(toolCalls[0].args)}`);

    return new Response(JSON.stringify(toolCalls[0].args), { 
        status: toolCalls.length ? 200 : 204,
        headers: { 'Content-Type': 'application/json' },
    });
}

