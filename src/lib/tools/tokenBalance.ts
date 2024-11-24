interface TokenBalance {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    type: string;
  };
  value: string;
  valueUsd: string | null;
}

/**
 * Fetches token balances for an Ethereum address from Blockscout API
 * @param address The Ethereum address to look up
 * @returns Array of token balances with metadata
 */
export async function getTokenBalances(address: string, chain: string): Promise<TokenBalance[]> {

  console.log('Running getTokenBalances tool with address:', address, 'and chain:', chain);
  try {
    const response = await fetch(
      `https://${chain}.blockscout.com/api/v2/addresses/${address}/tokens`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items as TokenBalance[];

  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}
