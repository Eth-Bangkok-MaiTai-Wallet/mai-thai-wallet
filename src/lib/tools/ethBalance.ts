import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, base, sepolia } from 'viem/chains';

interface EthBalance {
  value: string;
}

/**
 * Fetches ETH balance for an Ethereum address using viem
 * @param address The Ethereum address to look up
 * @param chain The blockchain network to query (e.g. eth, base, sepolia)
 * @returns ETH balance
 */
export async function getEthBalance(address: string, chain: string): Promise<EthBalance> {
  console.log('Running getEthBalance tool with address:', address, 'and chain:', chain);
  
  try {
    const chainConfig = {
      eth: mainnet,
      base: base, 
      sepolia: sepolia
    }[chain];

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const client = createPublicClient({
      chain: chainConfig,
      transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`)
    });

    const balanceWei = await client.getBalance({ address: address as `0x${string}` });
    const balanceEth = formatEther(balanceWei);

    return {
      value: balanceEth
    };

  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    throw error;
  }
}
