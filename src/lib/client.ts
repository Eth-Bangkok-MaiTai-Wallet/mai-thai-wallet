import { createPublicClient, http, PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

const publicClients: { [chainId: number]: PublicClient } = {};

export const getPublicClient = (chainId: number): PublicClient => {
  if (publicClients[chainId]) {
    return publicClients[chainId];
  }

  let client: PublicClient;

  switch (chainId) {
    case 1: // Ethereum Mainnet
      client = createPublicClient({
        chain: mainnet,
        transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
      break;
    case 84531: // Base
      client = createPublicClient({
        chain: {
          id: 84531,
          name: 'Base',
          network: 'base',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: [`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`],
            },
          },
        },
        transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
      break;
    case 11155111: // Ethereum Sepolia
      client = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
      break;
    case 84532: // Base Sepolia
      client = createPublicClient({
        chain: {
          id: 84532,
          name: 'Base Sepolia',
          network: 'baseSepolia',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: [`https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`],
            },
          },
        },
        transport: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      });
      break;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  publicClients[chainId] = client;
  return client;
};