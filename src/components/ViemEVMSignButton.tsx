// import { BlockchainTypes, CrossmintEVMWalletAdapter } from "@crossmint/connect";
import React, { useState } from "react";
import { createWalletClient, custom } from 'viem';
// import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { optimismSepolia } from 'viem/chains';
// import { kv } from '@vercel/kv';

export default function ViemEVMSignButton() {
    const [smartWalletAddress, setSmartWalletAddress] = useState("");

    const CHAIN = "optimism-sepolia";

    // const crossmintConnect = new CrossmintEVMWalletAdapter({
    //     chain: BlockchainTypes.ETHEREUM,
    // });

    const createSmartWallet = async (adminSignerAddress: string) => {
      const response = await fetch('/api/crossmint_create_wallet', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminSignerAddress })
      });
      return response.json();
    };

    async function addDelegateSigner(agentAddress: string, smartWalletAddress: string) {
      const response = await fetch('/api/crossmint_delegate_signer', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agentAddress, smartWalletAddress })
      });
      return response.json();
  }

    const handleClick = async () => {
        let smartWalletAddress;

        try {
            const client = createWalletClient({
                chain: optimismSepolia,
                transport: custom(window.ethereum)
            });

            const accounts = await client.requestAddresses();
            const adminSignerAddress = accounts[0];
            console.log('Admin signer address:', adminSignerAddress);

            const response = await fetch(`/api/kv_get?key=${adminSignerAddress}`);
            smartWalletAddress = (await response.json()).data;

            console.log('Smart wallet address fetched from kv:', smartWalletAddress);

            if (!smartWalletAddress) {
                const createWalletResponse = await createSmartWallet(adminSignerAddress);
                smartWalletAddress = createWalletResponse.address;
            } else {
                console.log('Smart wallet address already exists:', smartWalletAddress);
            }

            setSmartWalletAddress(smartWalletAddress);

            const agentAddress = await (await fetch('/api/get_agent_address', {
                method: 'GET'
            })).json();

            const delegate = await (await fetch(`/api/crossmint_get_delegate?smartWalletAddress=${smartWalletAddress}&signerAddress=${agentAddress}`, {
              method: 'GET'
            })).json();

            console.log('delegate', delegate);

            if (!delegate) {
                console.log('Delegate not found, creating delegate');
                const addDelegateSignerResponse = await addDelegateSigner(agentAddress, smartWalletAddress);

                console.log(addDelegateSignerResponse);
  
                console.log(addDelegateSignerResponse.chains[CHAIN].approvals.pending[0]);
  
                const message = addDelegateSignerResponse.chains[CHAIN].approvals.pending[0].message;

                const signature = await client.signMessage({
                  account: adminSignerAddress,
                  message: { raw: message },
                });
  
              //   const signature = await crossmintConnect.signMessage(message.toString());
                console.log(signature);

                await fetch('/api/crossmint_approve_delegation', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ smartWalletAddress, adminSignerAddress, signature, signatureId: addDelegateSignerResponse.chains[CHAIN].id })
                })

                const kvSetResponse =   await (await fetch('/api/kv_set', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ key: adminSignerAddress, value: smartWalletAddress })
                })).json();

                console.log('KV set response:', kvSetResponse);
            }





            // if (smartWalletAddress) {
            //     console.log('Smart wallet address:', smartWalletAddress);
            //     setSmartWalletAddress(smartWalletAddress);

            //     const delegate = await (await fetch(`/api/crossmint_get_delegate?smartWalletAddress=${smartWalletAddress}`, {
            //       method: 'GET'
            //     })).json();

            //     console.log('delegate', delegate);

                
            //     return;
            // }

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

              // const createWalletResponse = await createSmartWallet(adminSignerAddress);
               
              // console.log(createWalletResponse);
              
              // smartWalletAddress = createWalletResponse.address;
              // setSmartWalletAddress(smartWalletAddress);
              
              // console.log(smartWalletAddress);


              // Add delegate signer

              // generate private key for agent
            //   const agentKey = generatePrivateKey();
            //   console.log('agentKey', agentKey);
            //   const agentSigner = privateKeyToAccount(agentKey);

           

            //   const agentAddress = agentSigner.address;

            //   const addDelegateSignerOptions = {
            //     method: 'POST',
            //     headers: {'X-API-KEY': apiKey, 'Content-Type': 'application/json'},
            //     body: `{"signer":"${agentAddress}","chain":"optimism-sepolia"}`
            //   };
              
            //   const addDelegateSignerResponse = await (await fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signers`, addDelegateSignerOptions)).json();


             
              // sign message with admin signer (approve registration of delegate signer)

             



            //   const options = {
            //     method: 'POST',
            //     headers: {'X-API-KEY': apiKey, 'Content-Type': 'application/json'},
            //     body: `{"approvals":[{"signer":"evm-keypair:${adminSignerAddress}","signature":"${signature}"}]}`
            //   };
              
            //   fetch(`https://staging.crossmint.com/api/v1-alpha2/wallets/${smartWalletAddress}/signatures/${addDelegateSignerResponse.chains[CHAIN].id}/approvals`, options)
            //     .then(response => response.json())
            //     .then(response => console.log(response))
            //     .catch(err => console.error(err));


              console.log('completed');

              // return smartWalletAddress;

        } catch (err) {
            console.error('Error creating session', err);
        }
    }
    
    return (
      <button 
        onClick={handleClick}
        style={{
          backgroundColor: '#4CAF50',
          border: 'none',
          color: 'white',
          padding: '10px 20px',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-block',
          fontSize: '16px',
          margin: '4px 2px',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'background-color 0.3s',
          width: '200px',
        }}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#B0C4DE';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#6699CC';
        }}
      >
        {smartWalletAddress ? (
          smartWalletAddress.length > 20 ? 
            `${smartWalletAddress.slice(0, 4)}...${smartWalletAddress.slice(-4)}` 
            : smartWalletAddress
        ) : "Connect Wallet"}
      </button>
    );
}
