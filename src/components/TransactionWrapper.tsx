'use client';
import { usdc_base_abi } from '@/constants';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type {
  TransactionError,
  TransactionResponse,
} from '@coinbase/onchainkit/transaction';
import { Address, ContractFunctionParameters, encodeFunctionData, parseEther, parseUnits } from 'viem';
import { Transaction as BlockchainTransaction } from '@/lib/tools/utils';

export default function TransactionWrapper({ onStatus, transactions, chainId, disabled, value }: { onStatus: any, transactions: BlockchainTransaction[], chainId: number, disabled: boolean, value?: bigint }) {
  // const contracts = [
  //   {
  //     address: address,
  //     abi: abi,
  //     functionName: functionName,
  //     args: args,
  //   },
  // ] as unknown as ContractFunctionParameters[];

  // const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  // const amount = parseUnits("0.00001", 6)
  // const encodedErc20Data = encodeFunctionData({
  //   abi: usdc_base_abi,
  //   functionName: 'transfer',
  //   args: [receiver, amount]
  // });

  
  // const to = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  // const calls = [
    //   {
      //     to: to,
      //     data: encodedErc20Data,
      //     value: ""
      //   },
      // ];
      
  const calls = transactions
  
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
        onStatus={onStatus}
      >
        <TransactionButton className="mt-0 mr-auto ml-auto w-[450px] max-w-full text-[white]" />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  );
}
