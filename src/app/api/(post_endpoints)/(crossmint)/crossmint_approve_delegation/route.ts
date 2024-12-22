export async function POST(req: Request) {
    const { smartWalletAddress, adminSignerAddress, signature, signatureId } = await req.json();

    console.log(smartWalletAddress, adminSignerAddress, signature, signatureId);
  
    const options = {
      method: 'POST',
      headers: {'X-API-KEY': process.env.CROSSMINT_API_KEY!, 'Content-Type': 'application/json'},
      body: `{"approvals":[{"signer":"evm-keypair:${adminSignerAddress}","signature":"${signature}"}]}`
    };
    
    const res =  await (await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signatures/${signatureId}/approvals`, options)).json();

    console.log(res);

    return new Response(JSON.stringify(res), { status: 201 });
}