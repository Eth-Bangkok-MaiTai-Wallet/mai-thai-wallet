'use client';
// import { usdc_base_abi } from '@/constants';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel
} from '@coinbase/onchainkit/transaction';
import type {
  LifecycleStatus,
  TransactionError,
  TransactionResponse,
} from '@coinbase/onchainkit/transaction';
// import { encodeFunctionData, parseUnits } from 'viem';
import { Transaction as BlockchainTransaction } from '@/lib/tools/utils';

export default function TransactionWrapper({ 
  onStatus, 
  transactions, 
  chainId,
  disabled
}: { 
  onStatus: (status: string) => void,
  transactions: BlockchainTransaction[], 
  chainId: number, 
  disabled: boolean, 
  value?: bigint 
}) {

  //read transaction object from vercel KV database

  // const contracts = [
  //   {
  //     address: address,
  //     abi: abi,
  //     functionName: functionName,
  //     args: args,
  //   },
  // ] as unknown as ContractFunctionParameters[];

  // const receiver = '0x38F4152654AaBFA65f0de2296327927FBBA8a381'
  // const amount = parseUnits("0.0001", 6)
  // const encodedErc20Data = encodeFunctionData({
  //   abi: usdc_base_abi,
  //   functionName: 'transfer',
  //   args: [receiver, amount]
  // });

  // const address: any = `0x38F4152654AaBFA65f0de2296327927FBBA8a381`;

  const convertedTransactions = transactions.map(transaction => ({
    ...transaction,
    value: BigInt(transaction.value)
  }));
  const calls = [...convertedTransactions]

  console.log("Calls: ", calls)

  // const to = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  // const calls = [
  //   {
  //     to: to,
  //     data: encodedErc20Data,
  //     value: ""
  //   },
  // ];

  const handleError = (err: TransactionError) => {
    console.log(err)
    console.error('Transaction error:', err);
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log('Transaction successful', response);
  };

  return (
    <div className="flex w-[450px]">
      <Transaction
        // contracts={contracts}
        calls={calls}
        className="w-[450px]"
        chainId={chainId}
        onError={handleError}
        onSuccess={handleSuccess}
        onStatus={(lifecycleStatus: LifecycleStatus) => onStatus(lifecycleStatus.statusName)}
      >
        <TransactionButton disabled={disabled} className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white]" />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
