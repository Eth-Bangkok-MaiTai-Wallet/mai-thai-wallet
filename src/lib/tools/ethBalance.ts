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
      eth: {
        network: mainnet,
        alchemyUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      },
      base: {
        network: base,
        alchemyUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      },
      sepolia: {
        network: sepolia,
        alchemyUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      }
    }[chain];

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const client = createPublicClient({
      chain: chainConfig.network,
      transport: http(chainConfig.alchemyUrl)
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
