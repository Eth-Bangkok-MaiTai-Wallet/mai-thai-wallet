import { encodeFunctionData, Hex, zeroHash, parseAbiItem } from 'viem';
import { getPublicClient } from '../client';
import { erc20Abi } from "../abi/erc20Abi";
import { eigenLayerStrategyManagerAbi } from "../abi/eigneLayerStrategyManagerAbi";
import { Transaction } from '../utils';
import delegationManagerAbi from '../abi/eigenLayerDelegationManagerAbi.json';

const sfrxEthEthereumMainnet = "0xac3E018457B222d93114458476f3E3416Abbe38F";
const frxEthAddress = "0x5E8422345238F34275888049021821E8E08CAa1f";
const eL_strategyManager = "0x858646372CC42E1A627fcE94aa7A7033e7CF075A";
const eL_sfrxEthStrategy = "0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6";
const eigenYields = "0x5ACCC90436492F24E6aF278569691e2c942A676d";
const eigenLayerDelegationManager = "0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A";

export const generateDepositTxBundle = async (
  userWallet: string,
  amount: string,
): Promise<Transaction[]> => {

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

    // delegate to
    const delegateToData = encodeFunctionData({
        abi: delegationManagerAbi,
        args: [eigenYields, [zeroHash, BigInt(0)], zeroHash],
        functionName: 'delegateTo',
    });

    const delegateToTransactionData: Transaction = {
        to: eigenLayerDelegationManager,
        data: delegateToData,
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

    const txBundle = [depositToFrxEthTransactionData, approveSfrxEthTransactionData, delegateToTransactionData, depositTransactionData];

    console.log("----Restake Tx Builder----:", txBundle);

    return txBundle;
}

export const generateQueueWithdrawalTxBundle = async (
    userWallet: string,
    // amount: string,
  ): Promise<Transaction[]> => {

    const publicClient = getPublicClient(1);

    const shares = await publicClient.readContract({
      address: eL_strategyManager,
      abi: eigenLayerStrategyManagerAbi,
      functionName: 'stakerStrategyShares',
      args: [userWallet, eL_sfrxEthStrategy],
    })

    const queuedWithdrawalParams = [
      {
        strategies: [eL_sfrxEthStrategy],
        shares: [shares],
        withdrawer: userWallet,
      },
    ];
  
    const queueWithdrawalsData = encodeFunctionData({
      abi: delegationManagerAbi,
      args: [queuedWithdrawalParams],
      functionName: 'queueWithdrawals',
    });
  
    const queueWithdrawalsTransactionData: Transaction = {
      to: eigenLayerDelegationManager,
      data: queueWithdrawalsData,
      value: '0',
    };
  
    const txBundle = [queueWithdrawalsTransactionData];
  
    console.log("----Restake Tx Builder (Queue Withdrawal)----:", txBundle);
  
    return txBundle;
}

export const completeQueuedWithdrawal = async (hash: string, userWallet: string) => {

  const withdrawals = await getWithdrawalFromTxHash(hash, userWallet)


  const completeQueuedWithdrawalData = encodeFunctionData({
    abi: delegationManagerAbi,
    args: [withdrawals[0], sfrxEthEthereumMainnet, BigInt(0), true],
    functionName: 'completeQueuedWithdrawal',
  });

  const completeQueuedWithdrawalTransactionData: Transaction = {
    to: eigenLayerDelegationManager,
    data: completeQueuedWithdrawalData,
    value: '0',
  };

  // ... existing code ...

  const txBundle = [completeQueuedWithdrawalTransactionData];

  console.log("----Restake Tx Builder (Complete Withdrawal)----:", txBundle);

  return txBundle;
}

const getWithdrawalFromTxHash = async (hash: string, userWallet: string) => {
    const publicClient = getPublicClient(1);

    const transaction = await publicClient.waitForTransactionReceipt({ hash: hash as Hex });

    console.log(transaction);

    return getEigenLayerQueuedWithdrawals(transaction.blockNumber, userWallet as Hex);
}

const getEigenLayerQueuedWithdrawals = async (blockNumber: bigint, staker: `0x${string}`): Promise<any[]> => {

    const publicClient = getPublicClient(1);
    const withdrawalQueuedEvent = parseAbiItem('event WithdrawalQueued(bytes32 withdrawalRoot,(address staker,address delegatedTo,address withdrawer,uint256 nonce,uint32 startBlock,address[] strategies,uint256[] shares))');
    
    const withdrawals = [];
    
    const eigenLogs = await publicClient.getLogs({  
        address: eigenLayerDelegationManager,
        event: withdrawalQueuedEvent,
        // not indexed.. 
        // args: [{
        //     staker: log.args.staker
        // }],
        fromBlock: blockNumber,
        toBlock: blockNumber,
    });

    for (const eigenLog of eigenLogs) {
        console.log(`EigenLayer withdrawal: ${eigenLog}`);
        if (eigenLog.args[1]?.staker === staker) {
          withdrawals.push(eigenLog.args[1]);

            console.log(eigenLog.args[1].delegatedTo);
            console.log(eigenLog.args[1].nonce);
            console.log(eigenLog.args[1].shares);
            console.log(eigenLog.args[1].staker);
            console.log(eigenLog.args[1].startBlock);
            console.log(eigenLog.args[1].strategies);
            console.log(eigenLog.args[1].withdrawer);
        }
    }
    console.log(`eigenwithdrawals ${withdrawals}`);

    return withdrawals;
}
