// import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/connect";
import React from "react";
import { createWalletClient, custom } from 'viem';
// import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { optimismSepolia } from 'viem/chains';

export default function ViemEVMSignButton() {

    const CHAIN = "optimism-sepolia";

    // const crossmintConnect = new CrossmintEVMWalletAdapter({
    //     chain: BlockchainTypes.ETHEREUM,
    // });

    const handleClick = async () => {
        try {
            const client = createWalletClient({
                chain: optimismSepolia,
                transport: custom(window.ethereum)
            });

            const accounts = await client.requestAddresses();
            const adminSignerAddress = accounts[0];
            console.log('Connected address:', adminSignerAddress);

            // const adminSignerAddress = await crossmintConnect.connect();
            // console.log(adminSignerAddress);

            // Create a smart wallet
            // const createWalletOptions = {
            //     method: 'POST',
            //     headers: {
            //       'X-API-KEY': apiKey,
            //       'Content-Type': 'application/json'
            //     },
            //     body: `{"type":"evm-smart-wallet","config":{"adminSigner":{"type":"evm-keypair","address":"${adminSignerAddress}"}}}`
            //   };
            
            //   const createWalletResponse = await (await fetch('https://staging.crossmint.com/api/v1-alpha2/wallets', createWalletOptions)).json();

              const createWalletResponse = await (await fetch('/api/crossmint_create_wallet', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ adminSignerAddress })
              })).json();
               
              console.log(createWalletResponse);
              
              const smartWalletAddress = createWalletResponse.address;
              
              console.log(smartWalletAddress);


              // Add delegate signer

              // generate private key for agent
            //   const agentKey = generatePrivateKey();
            //   console.log('agentKey', agentKey);
            //   const agentSigner = privateKeyToAccount(agentKey);

              const agentAddress = await (await fetch('/api/get_agent_address', {
                method: 'GET'
              })).json();

            //   const agentAddress = agentSigner.address;
              console.log(agentAddress);

            //   const addDelegateSignerOptions = {
            //     method: 'POST',
            //     headers: {'X-API-KEY': apiKey, 'Content-Type': 'application/json'},
            //     body: `{"signer":"${agentAddress}","chain":"optimism-sepolia"}`
            //   };
              
            //   const addDelegateSignerResponse = await (await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signers`, addDelegateSignerOptions)).json();

              const addDelegateSignerResponse = await (await fetch('/api/crossmint_delegate_signer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ agentAddress, smartWalletAddress })
              })).json();

              console.log(addDelegateSignerResponse);

              console.log(addDelegateSignerResponse.chains[CHAIN].approvals.pending[0]);

              const message = addDelegateSignerResponse.chains[CHAIN].approvals.pending[0].message;

              // sign message with admin signer (approve registration of delegate signer)

              const signature = await client.signMessage({
                account: adminSignerAddress,
                message: { raw: message },
              });

            //   const signature = await crossmintConnect.signMessage(message.toString());


              console.log(signature);



            //   const options = {
            //     method: 'POST',
            //     headers: {'X-API-KEY': apiKey, 'Content-Type': 'application/json'},
            //     body: `{"approvals":[{"signer":"evm-keypair:${adminSignerAddress}","signature":"${signature}"}]}`
            //   };
              
            //   fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signatures/${addDelegateSignerResponse.chains[CHAIN].id}/approvals`, options)
            //     .then(response => response.json())
            //     .then(response => console.log(response))
            //     .catch(err => console.error(err));


              await fetch('/api/crossmint_approve_delegation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ smartWalletAddress, adminSignerAddress, signature, signatureId: addDelegateSignerResponse.chains[CHAIN].id })
              })

              console.log('completed');

        } catch (err) {
            console.error('Error creating session', err);
        }
    };
    
    return <button onClick={handleClick}>Create Session</button>;
}
