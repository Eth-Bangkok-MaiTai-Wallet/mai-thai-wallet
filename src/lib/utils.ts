import { Hex } from "viem";
import { smartWalletFactory } from '@/lib/smartWalletClient';
import { CrossmintApiClient } from '@crossmint/common-sdk-base';
import { kv } from "@vercel/kv";

export async function extractJSONFromStream(stream: ReadableStream | null) {
    if (!stream) {
        return null;
    }
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
  
    // Parse the JSON string
    return JSON.parse(result);
}

export interface Transaction {
  to: Hex;
  // gasLimit?: string;
  data: Hex;
  value: string;
}

export interface Segment {
  text: string,
  speaker: string,
  speaker_id: number,
  is_user: boolean,
  person_id: number,
  start: number,
  end: number
}

const smartWalletAddress = await kv.get('smartWalletAddress') as string;

const apiClient = new CrossmintApiClient(
  {
      apiKey: process.env.CROSSMINT_API_KEY || '',
  },
  {
      internalConfig: {
          sdkMetadata: {
              name: "crossmint-sdk-base",
              version: "0.1.0",
          },
      },
  },
);


const smartwallet = smartWalletFactory(apiClient);

export const smartWalletClient = await smartwallet({
  address: smartWalletAddress,
  signer: {
      secretKey: process.env.AGENT_SIGNER_PRIVATE_KEY as Hex,
  },
  chain: "optimism-sepolia",
  provider: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY!}`,
})