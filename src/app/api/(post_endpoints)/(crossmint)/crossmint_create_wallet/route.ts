import { kv } from '@vercel/kv';

export async function POST(req: Request) {
    const { adminSignerAddress } = await req.json();

    console.log(adminSignerAddress);
  
    const createWalletOptions = {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.CROSSMINT_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: `{"type":"evm-smart-wallet","config":{"adminSigner":{"type":"evm-keypair","address":"${adminSignerAddress}"}}}`
    };

    const res =  await (await fetch('https://staging.crossmint.com/api/v1-alpha2/wallets', createWalletOptions)).json();

    console.log(res);

    await kv.set(adminSignerAddress, res.address);

    return new Response(JSON.stringify(res), { status: 201 });
    
    // return fetch('https://staging.crossmint.com/api/v1-alpha2/wallets', createWalletOptions);
       

    // return new Response(JSON.stringify(createWalletResponse), { 
    //   status: createWalletResponse ? 200 : 204,
    //   headers: { 'Content-Type': 'application/json' },
    // });
}