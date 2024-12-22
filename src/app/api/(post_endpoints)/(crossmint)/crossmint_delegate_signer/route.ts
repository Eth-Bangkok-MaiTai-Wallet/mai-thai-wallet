export async function POST(req: Request) {
    const { agentAddress, smartWalletAddress } = await req.json();

    console.log( agentAddress, smartWalletAddress);
  
    const addDelegateSignerOptions = {
      method: 'POST',
      headers: {'X-API-KEY': process.env.CROSSMINT_API_KEY!, 'Content-Type': 'application/json'},
      body: `{"signer":"${agentAddress}","chain":"optimism-sepolia"}`
    };
    
    return fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signers`, addDelegateSignerOptions);

    // return new Response(JSON.stringify(createWalletResponse), { 
    //   status: createWalletResponse ? 200 : 204,
    //   headers: { 'Content-Type': 'application/json' },
    // });
}