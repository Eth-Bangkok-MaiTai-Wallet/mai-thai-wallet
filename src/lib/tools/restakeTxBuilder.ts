import { encodeFunctionData, Hex } from 'viem';
import { getPublicClient } from '../client';
import { erc20Abi } from "../abi/erc20Abi";
import { eigenLayerStrategyManagerAbi } from "../abi/eigneLayerStrategyManagerAbi";
import { Transaction } from '../utils';

export const generateDepositTxBundle = async (
  userWallet: string,
  amount: string,
): Promise<Transaction[]> => {

    const sfrxEthEthereumMainnet = "0xac3E018457B222d93114458476f3E3416Abbe38F";
    const frxEthAddress = "0x5E8422345238F34275888049021821E8E08CAa1f";
    const eL_strategyManager = "0x858646372CC42E1A627fcE94aa7A7033e7CF075A";
    const eL_sfrxEthStrategy = "0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6";

    const publicClient = getPublicClient(1);

    const minterAddress = await publicClient.readContract({
        address: frxEthAddress,
        abi: [
            {
                name: 'minters_array',
                type: 'function',
                inputs: [
                    {
                        name: 'index',
                        type: 'uint256'
                    }
                ],
                outputs: [
                    {
                        name: 'minter',
                        type: 'address'
                    }
                ]
            }
        ],
        functionName: 'minters_array',
        args: [BigInt(0)],
    }) as Hex;

    // Encode the deposit function data for depositing ETH into frxETH and staking frxETH in sfrxETH
    const depositToFrxEthData = encodeFunctionData({
        abi: [
            {
                name: 'submitAndDeposit',
                type: 'function',
                stateMutability: 'payable',
                inputs: [
                    {
                        name: 'recipient',
                        type: 'address'
                    }
                ],
                outputs: [
                    {
                        name: 'shares',
                        type: 'uint256'
                    }
                ]
            }
        ],
        args: [userWallet as Hex],
        functionName: 'submitAndDeposit',
    });

    const depositToFrxEthTransactionData: Transaction = {
        to: minterAddress,
        data: depositToFrxEthData,
        value: amount,
    }

    // Approve eigenlayer to spend sfrxEth
    const approveSfrxEthData = encodeFunctionData({
        abi: erc20Abi,
        args: [eL_strategyManager, amount],
        functionName: 'approve',
    });

    const approveSfrxEthTransactionData: Transaction = {
        to: sfrxEthEthereumMainnet,
        data: approveSfrxEthData,
        value: '0',
    }
    
    // Encode the deposit function data
    const depositEigenLayerData = encodeFunctionData({
        abi: eigenLayerStrategyManagerAbi,
        args: [eL_sfrxEthStrategy, sfrxEthEthereumMainnet, amount],
        functionName: 'depositIntoStrategy',
    });

    const depositTransactionData: Transaction = {
        to: eL_strategyManager,
        data: depositEigenLayerData,
        value: '0',
    }

    const txBundle = [depositToFrxEthTransactionData, approveSfrxEthTransactionData, depositTransactionData];

    console.log("----Restake Tx Builder----:", txBundle);

    return txBundle;
}
