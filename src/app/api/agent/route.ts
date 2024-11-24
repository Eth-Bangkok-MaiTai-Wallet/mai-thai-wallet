import { decodeQR } from '@/lib/tools/qrDecoder';
import { getTokenBalances } from '@/lib/tools/tokenBalance';
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
// import 'dotenv/config';
import { z } from 'zod';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log(messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
          tokenBalance: tool({
            description: 'A tool for fetching token balances for an Ethereum address. Expects a valid ethereum address as input along with the chain name (e.g. eth, base, sepolia, etc.)',
            parameters: z.object({ address: z.string(), chain: z.string() }),
            execute: async ({ address, chain = 'eth' }) => getTokenBalances(address, chain),
          }),
          qrDecoder: tool({
            description: 'A tool for decoding QR codes. Takes a base64 encoded image as input and returns the decoded text.',
            parameters: z.object({ base64Image: z.string() }),
            execute: async ({ base64Image }) => decodeQR(base64Image),
          }),
          answer: tool({
            description: 'A tool for providing the final answer.',
            parameters: z.object({
              steps: z.array(
                z.object({
                  tokenBalance: z.string(),
                  reasoning: z.string(),
                }),
              ),
              answer: z.string(),
            }),
          }),
        },
        toolChoice: 'required',
        maxSteps: 10,
        system:
          'You are checking token balances for an Ethereum address. ' +
          'Reason step by step. ' +
          'Use the tokenBalance tool when necessary. ' +
          'Use the qrDecoder tool when base64 encoded images are provided. ' +
          'When you give the final answer, provide an explanation for how you got it.',
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

