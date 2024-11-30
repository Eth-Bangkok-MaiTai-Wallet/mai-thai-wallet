// import { parseEther } from 'viem';
import { usdc_base_abi } from "@/constants";
import { kv } from "@vercel/kv";
import { encodeFunctionData, parseUnits } from 'viem'; // Add viem import
import { lookupENS } from "./ensLookup";
import { Transaction } from "../utils";
import { Hex } from "viem";
  
/**
 * Fetches token balances for an Ethereum address from Blockscout API
 * @param address The Ethereum address to look up
 * @returns Array of token balances with metadata
*/
export async function getEthTransferObject(address: string, amount: string): Promise<Transaction[]> {
    console.log('Running getEthTransferObject tool with address:', address, 'and amount:', amount);
    try {
      const transferObject = {
        to: address as Hex,
        data: "0x" as Hex,
        value: amount
      }
      
      await kv.set("transactions", [transferObject]);

      const storedTransaction: Transaction[] | null = await kv.get<Transaction[]>("transactions");
      console.log("Stored transaction: ", storedTransaction);
      return [transferObject]
  
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
}

function tokenLookup(token: string) : Hex {
  token = token.toLowerCase()
  switch (token) {
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

const tokenDecimals: Record<Hex, number> = {
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,
  '0x4200000000000000000000000000000000000006': 18,
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': 18,
  '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c': 8,
}

// const emptyObject = {
//   to: "",
//   data: "",
//   value: ""
// }

export async function getErc20TransferObject(token: string, receiver: string, amount: string): Promise<Transaction[]> {
  console.log('Running getErc20TransferObject tool with address:', token, 'receiver: ', receiver, 'and amount:', amount);
  try {
    if(!token || !receiver || !amount){
      return []
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(token)) {
      token = tokenLookup(token)
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
      const receiver_address = await lookupENS(receiver)
      receiver = receiver_address ? receiver_address : ""
    }

    const decimals = tokenDecimals[token as Hex];

    if(!token || !decimals || !receiver){
      return []
    }

    console.log("Amount in getErc20TransferObject tool: ", amount)
    console.log("After parsing: ", parseUnits(amount, decimals))

    const transferObject = {
      to: token as Hex,
      data: encodeFunctionData({
        abi: usdc_base_abi,
        functionName: 'transfer',
        args: [receiver, parseUnits(amount, decimals)]
      }),
      value: '0'
    }
    
    await kv.set("transactions", [transferObject]);

    const storedTransaction: Transaction[] | null = await kv.get<Transaction[]>("transactions");
    console.log("Stored transaction: ", storedTransaction);
    return [transferObject]

  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}
  