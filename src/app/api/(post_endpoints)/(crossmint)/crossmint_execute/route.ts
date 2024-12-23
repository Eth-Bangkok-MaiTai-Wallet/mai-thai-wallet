import { getSmartWalletClient } from '@/lib/utils';
import { EVMTransaction } from '@goat-sdk/wallet-evm';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {

    console.log("Executing stored transaction");

    console.log(req.body);

    const walletAddress = await kv.get('connectedWallet') as string;
  
    const smartWalletClient = await getSmartWalletClient(walletAddress);

    console.log("Smart wallet client: ", smartWalletClient.getAddress());

    const txStore = await kv.get('crossmintTx') as EVMTransaction[]

    const tx = await smartWalletClient.sendBatchOfTransactions(txStore);

    console.log("Transaction: ", tx);

    return new Response(JSON.stringify(tx), { status: 201 });
}