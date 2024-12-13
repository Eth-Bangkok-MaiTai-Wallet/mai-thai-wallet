import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { completeQueuedWithdrawal } from '@/lib/tools/restakeTxBuilder';
import { kv } from '@vercel/kv';
import { Transaction } from '@/lib/utils';
import { convertToWei } from '@/lib/tools/ethUnitConverter';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log("----Complete Unestake Agent----:", messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
            convertToWei: tool({
              description: 'A tool for converting an Ether amount to Wei. Use this tool to convert the user input amount to Wei. Parameters are amount to convert and unit of the amount (e.g. eth, ether, gwei, etc.)',
              parameters: z.object({amount: z.string(), unit: z.string()}),
              execute: async ({amount, unit}) => convertToWei(amount, unit)
            }),
            complete_unrestake: tool({
              description: 'A tool for creating a transaction object to complete a queued eigenlayer withdrawal. Use this tool when classification result is complete_unrestake. Parameters are the transaction hash of the queueWithdrawal transaction and user wallet address',
              parameters: z.object({txHash: z.string(), userWallet: z.string()}),
              execute: async ({txHash, userWallet}) => completeQueuedWithdrawal(txHash, userWallet)
            }),
            answer: tool({
                description: 'A tool for providing the final answer.',
                parameters: z.object({
                  steps: z.array(
                    z.object({
                      restakeTransaction: z.array(z.object({to: z.string(), data: z.string(), value: z.string()})),
                      reasoning: z.string(),
                    }),
                  ),
                  answer: z.string(),
                }),
              }),
		},
        maxSteps: 5,
		toolChoice: 'required',
        system:
          	'You are generating transaction object for Ethereum EVM execution. ' +
          	'result should be proposed transaction object' +
            'Use the tools provided to generate the transaction object.',
        prompt:
          JSON.stringify(messages),
    });
      
    console.log(`FINAL TOOL CALLS: ${JSON.stringify(toolCalls, null, 2)}`);

    console.log(`STEPS RESPONSE: ${JSON.stringify(toolCalls[0].args)}`);

    await kv.set("transactions", JSON.stringify((toolCalls[0].args as  { answer: string; steps: { restakeTransaction: { to: string; data: string; value: string; }[]; reasoning: string; }[]; }).steps[0].restakeTransaction));

    const storedTransaction: Transaction[] | null = await kv.get<Transaction[]>("transactions");
    console.log("Stored transaction: ", storedTransaction);

    

    return new Response(JSON.stringify(toolCalls[0].args), { 
        status: toolCalls.length ? 200 : 204,
        headers: { 'Content-Type': 'application/json' },
    });
}

