import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import {getErc20TransferObject} from '@/lib/tools/transactionObject';
import { z } from 'zod';
import { lookupENS } from '@/lib/tools/ensLookup';
import { getAddressForSymbol } from '@/lib/tools/tokenBalance';

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log("----Transaction----:", messages);

    const { toolCalls } = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
            erc20Transfer: tool({
              description: 'A tool for creating blockchain transaction object for erc20_transfer classification type. Use this tool when classification result is erc20_transfer_to_address or erc20_transfer_to_ens.',
              parameters: z.object({
                          token: z.string().describe("symbol or address of the token to interact with"),
                          receiver: z.string().describe("address of the receiver"),
                          amount: z.string().describe("amount of token to transfer")
                      }),
              execute: async ({token, receiver, amount}) => getErc20TransferObject(token, receiver, amount)
            }),
            ensLookup: tool({
              description: 'A tool for resolving ens names to ethereum addresses. Expects a valid ens name as input. Returns null if the ens name is not found and an address otherwise. Use this tool when classification result is eth_transfer_to_ens.',
              parameters: z.object({ens: z.string()}),
              execute: async ({ens}) => lookupENS(ens)
            }),
            tokenAddress: tool({
              description: 'A tool for getting token address from a symbol. Expects a token symbol as an input along with the chain name (e.g. eth, base, sepolia, etc.)',
              parameters: z.object({ symbol: z.string(), chainId: z.number() }),
              execute: async ({ symbol, chainId }) => getAddressForSymbol(symbol, chainId),
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
    });
      
    console.log(`FINAL TOOL CALLS: ${JSON.stringify(toolCalls, null, 2)}`);

    console.log(`STEPS RESPONSE: ${JSON.stringify(toolCalls[0].args)}`);

    return new Response(JSON.stringify(toolCalls[0].args), { 
        status: toolCalls.length ? 200 : 204,
        headers: { 'Content-Type': 'application/json' },
    });
}

