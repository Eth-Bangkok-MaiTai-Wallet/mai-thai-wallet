import { normalize } from 'viem/ens'
import { getPublicClient } from '../client';

  
  /**
   * Resolves ens names via alchemy api
   * @param ens The ENS name to look up
   * @returns The Ethereum address
   */
  export const lookupENS = async (ens: string): Promise<string | null> => {

    console.log("Looking up ENS: ", ens)

    const client = getPublicClient(1);

    console.log("Normalized ENS: ", normalize(ens))
    
    const ensAddress = await client.getEnsAddress({
        name: normalize(ens),
    })

    console.log(ensAddress);

    // console.log(`ENS: ${ens} -> ADDRESS: ${address}`);
    
    return ensAddress;
};
 
