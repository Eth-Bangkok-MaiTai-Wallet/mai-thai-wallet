import { Hex } from "viem";
import { extractJSONFromStream } from "../utils";
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

const tokenDecimals: Record<Hex, number> = {
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,
  '0x4200000000000000000000000000000000000006': 18,
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': 18,
  '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c': 8,
}

// const tokenAddresses: Record<string, Hex> = {
//   'usdc': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
//   'weth': 
// }

function tokenLookup(symbol: string) : Hex {
  symbol = symbol.toLowerCase()
  switch (symbol) {
    case 'usdc':
      return '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    case 'weth':
      return '0x4200000000000000000000000000000000000006';
    case 'dai':
      return '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
    default:
      return '0x' as Hex;
  }
}

/**
 * Fetches token balances for an Ethereum address from Blockscout API
 * @param address The Ethereum address to look up
 * @returns Array of token balances with metadata
 */
export async function getAddressForSymbol(symbol: string, chain: string): Promise<string> {

  console.log('Running getAddressForSymbol tool with symbol:', symbol, 'and chain:', chain);
  try {
    const address: string = tokenLookup(symbol)

    if (!address) {
      throw new Error(`Token not supported`);
    }

    return address;

  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}

export async function getDecimalsForAddress(address: string, chain: string): Promise<string> {

  console.log('Running getTokenBalances tool with address:', address, 'and chain:', chain);
  try {
    const response = await fetch(
      `https://${chain}.blockscout.com/api?module=token&action=getToken&contractaddress=${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Response: ", response)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await extractJSONFromStream(response.body);
    console.log("Body: ", body)
    // console.log("Decimals: ", data.decimals)
    return "6"

  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}