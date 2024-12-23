export async function GET(
    request: Request,
    props: { params: Promise<{ smartWalletAddress: string, signerAddress: string }>}
) {
    const params = await props.params;
    const smartWalletAddress = params.smartWalletAddress;
    const signerAddress = params.signerAddress;

    const options = {method: 'GET', headers: {'X-API-KEY': process.env.CROSSMINT_API_KEY!}};

    console.log('Smart wallet address:', smartWalletAddress);
    console.log('Signer address:', signerAddress);

    const response = await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signers/${signerAddress}`, options);

    console.log('Response:', response);
    const data = await response.json();

    console.log('Data:', data);

    return new Response(JSON.stringify(data), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
} 