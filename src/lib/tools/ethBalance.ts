import { formatEther } from 'viem';
import { getPublicClient } from '../client';

interface EthBalance {
  value: string;
}

/**
 * Fetches ETH balance for an Ethereum address using viem
 * @param address The Ethereum address to look up
 * @param chain The blockchain network to query (e.g. eth, base, sepolia)
 * @returns ETH balance
 */
export async function getEthBalance(address: string, chainId: number): Promise<EthBalance> {
  console.log('Running getEthBalance tool with address:', address, 'and chain:', chainId);
  
  try {
    const client = getPublicClient(chainId);

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
