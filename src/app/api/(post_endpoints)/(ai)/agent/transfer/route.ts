import { getTokenBalances } from '@/lib/tools/tokenBalance';
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import {getErc20TransferObject, getEthTransferObject} from '@/lib/tools/transactionObject';
import { z } from 'zod';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log("----Transaction----:", messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
			tokenBalance: tool({
				description: 'A tool for fetching token balances for an Ethereum address. Expects a valid ethereum address as input along with the chain name (e.g. eth, base, sepolia, etc.)',
				parameters: z.object({ address: z.string(), chain: z.string() }),
				execute: async ({ address, chain = 'eth' }) => getTokenBalances(address, chain),
			}),
			ethTransfer: tool({
				description: 'A tool for creating blockchain transaction object for eth_transfer classification type. Use this tool when classification result is eth_transfer_to_address or eth_transfer_to_ens.',
				parameters: z.object({address: z.string(), amount: z.string()}),
				execute: async ({address, amount}) => getEthTransferObject(address, amount)
			}),
            erc20Transfer: tool({
				description: 'A tool for creating blockchain transaction object for erc20_transfer classification type. Use this tool when classification result is erc20_transfer_to_address or erc20_transfer_to_ens.',
				parameters: z.object({
                    token: z.string().describe("symbol or address of the token to interact with"),
                    receiver: z.string().describe("address of the receiver"),
                    amount: z.string().describe("amount of token to transfer")
                }),
				execute: async ({token, receiver, amount}) => getErc20TransferObject(token, receiver, amount)
			}),
		},
        maxSteps: 5,
		toolChoice: 'required',
        system:
          	'You are generating transaction object for Ethereum EVM execution. ' +
          	'Depending on the classification type you need to generate object accordingly. ' +
          	'result should be proposed transaction object',
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

