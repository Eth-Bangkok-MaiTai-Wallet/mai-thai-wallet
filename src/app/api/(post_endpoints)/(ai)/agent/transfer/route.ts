import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import {getEthTransferObject} from '@/lib/tools/transactionObject';
// import 'dotenv/config';
import { z } from 'zod';
import { lookupENS } from '@/lib/tools/ensLookup';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log("----Transaction----:", messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
			ethTransfer: tool({
				description: 'A tool for creating blockchain transaction object for eth_transfer classification type. Use this tool when classification result is eth_transfer_to_address or eth_transfer_to_ens.',
				parameters: z.object({address: z.string(), amount: z.string()}),
				execute: async ({address, amount}) => getEthTransferObject(address, amount)
			}),
			ensLookup: tool({
				description: 'A tool for resolving ens names to ethereum addresses. Expects a valid ens name as input. Returns null if the ens name is not found and an address otherwise. Use this tool when classification result is eth_transfer_to_ens.',
				parameters: z.object({ens: z.string()}),
				execute: async ({ens}) => lookupENS(ens)
			}),
            answer: tool({
                description: 'A tool for providing the final answer.',
                parameters: z.object({
                  steps: z.array(
                    z.object({
                      transferObject: z.object({address: z.string(), amount: z.string()}),
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
          	'Depending on the classification type you need to generate object accordingly. ' +
          	'result should be proposed transaction object' +
            'Use the tools provided to generate the transaction object. I.e. if you need to resolve ens name to address, use ensLookup tool. For formulating the transaction object use the ethTransfer tool.',
        prompt:
          JSON.stringify(messages),
        // schema: z.object({
        //     address: z.string(),
        //     amount: z.string()
        // })
    });
      
    console.log(`FINAL TOOL CALLS: ${JSON.stringify(toolCalls, null, 2)}`);

    console.log(`STEPS RESPONSE: ${JSON.stringify(toolCalls[0].args)}`);

    return new Response(JSON.stringify(toolCalls[0].args), { 
        status: toolCalls.length ? 200 : 204,
        headers: { 'Content-Type': 'application/json' },
    });
}

