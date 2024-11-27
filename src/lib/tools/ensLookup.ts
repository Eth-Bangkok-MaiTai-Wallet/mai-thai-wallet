import { normalize } from 'viem/ens'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
  
  /**
   * Resolves ens names via alchemy api
   * @param ens The ENS name to look up
   * @returns The Ethereum address
   */
  export const lookupENS = async (ens: string): Promise<string | null> => {

    const client = createPublicClient({ 
        chain: mainnet, 
        transport: http(), 
    }) 
    
    const ensAddress = await client.getEnsAddress({
        name: normalize(ens),
    })

    console.log(ensAddress);

    // console.log(`ENS: ${ens} -> ADDRESS: ${address}`);
    
    return ensAddress;
};
 