import { parseEther } from 'viem';
import { kv } from "@vercel/kv";

// interface TransferObject {
//     to: string,
//     data: string,
//     amount: BigInt
// }
  
/**
 * Fetches token balances for an Ethereum address from Blockscout API
 * @param address The Ethereum address to look up
 * @returns Array of token balances with metadata
*/
export async function getEthTransferObject(address: string, amount: string): Promise<any> {
    console.log('Running getEthTransferObject tool with address:', address, 'and amount:', amount);
    try {
      const transferObject = {
        to: address,
        data: "0x",
        amount: amount//parseEther(amount)
      }
      
      //save transferObject to vercel KV database
      await kv.set("transaction", JSON.stringify(transferObject));

      let storedTransaction: any = await kv.get<{ id: string; quantity: number }[]>("transaction");
      console.log("Stored transaction: ", storedTransaction);
      return transferObject
  
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
}
  