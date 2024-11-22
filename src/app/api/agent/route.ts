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
          // calculate: tool({
          //   description:
          //     'A tool for evaluating mathematical expressions. Example expressions: ' +
          //     "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
          //   parameters: z.object({ expression: z.string() }),
          //   execute: async ({ expression }) => mathjs.evaluate(expression),
          // }),
          // answer tool: the LLM will provide a structured answer
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
            // no execute function - invoking it will terminate the agent
          }),
        },
        toolChoice: 'required',
        maxSteps: 10,
        system:
          'You are checking token balances for an Ethereum address. ' +
          'Reason step by step. ' +
          'Use the tokenBalance tool when necessary. ' +
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

