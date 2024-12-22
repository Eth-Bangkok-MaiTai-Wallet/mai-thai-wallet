import {privateKeyToAccount} from 'viem/accounts';
import { Hex } from 'viem'

export async function GET() {

    const agentSigner = privateKeyToAccount(process.env.AGENT_SIGNER_PRIVATE_KEY! as Hex);

    const agentAddress = agentSigner.address;

    return new Response(JSON.stringify(agentAddress), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}