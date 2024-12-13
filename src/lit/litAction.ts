import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import {
    LitActionResource,
    createSiweMessage,
    generateAuthSig,
} from "@lit-protocol/auth-helpers";
import * as ethers from "ethers";

import dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.PK;
if (!privateKey) {
    throw new Error("Private key is not defined in the environment variables.");
}

export const litAction = async (number1: string, number2: string) => {
    const litNodeClient = new LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev,
        debug: false
    });
    await litNodeClient.connect();
      
    const ethersWallet = new ethers.Wallet(
        privateKey, // Replace with your private key
        new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );
      
    const sessionSignatures = await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        resourceAbilityRequests: [
            {
                resource: new LitActionResource("*"),
                ability: LIT_ABILITY.LitActionExecution,
            },
        ],
        authNeededCallback: async ({
          uri,
          expiration,
          resourceAbilityRequests,
        }) => {
          const toSign = await createSiweMessage({
            uri,
            expiration,
            resources: resourceAbilityRequests,
            walletAddress: await ethersWallet.getAddress(),
            nonce: await litNodeClient.getLatestBlockhash(),
            litNodeClient,
          });
      
          return await generateAuthSig({
            signer: ethersWallet,
            toSign,
          });
        },
    });
    
    const litActionCode = `
            const sum = Number(number1) + Number(number2)
            const response = "Sum of numbers is: " + sum;
            LitActions.setResponse({ response:response});
    `

    const sum = Number(number1) + Number(number2)
    
    const response = await litNodeClient.executeJs({
        sessionSigs: sessionSignatures,
        code: litActionCode,
        jsParams: {
            number1,
            number2
        }
    });
    
    return response
}

