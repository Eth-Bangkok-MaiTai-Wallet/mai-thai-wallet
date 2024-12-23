export async function GET(request: Request, { params }: { params: { smartWalletAddress: string, signerAddress: string }}) {
    const smartWalletAddress = await params.smartWalletAddress;
    const signerAddress = await params.signerAddress;

    const options = {method: 'GET', headers: {'X-API-KEY': process.env.CROSSMINT_API_KEY!}};

    console.log('Smart wallet address:', smartWalletAddress);
    console.log('Signer address:', signerAddress);

    const response = await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signers/${signerAddress}`, options);
    const data = await response.json();

    return new Response(JSON.stringify(data), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
} 