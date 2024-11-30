'use client';

import dotenv from 'dotenv';
dotenv.config();

import { useChat } from 'ai/react';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';
import { useAccount } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
// import { TransactionButton } from '@coinbase/onchainkit/transaction';
import TransactionWrapper from '@/components/TransactionWrapper';
import { BASE_CHAIN_ID } from '@/constants';
import { Transaction } from '@/lib/utils';

export default function Chat() {
  const { address, chainId, isConnected } = useAccount();
  const { isLoading,messages, input, handleInputChange, handleSubmit } = useChat();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch('/api/retrieve_transaction');
        const data = await response.json();

        console.log("Stored transaction: ", data.transactions);
        if(data.transactions){
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [messages]);

  // useEffect(() => {
  //   console.log("TransactionObject in state: ", transactions)
  // }, [transactions])

  return (
    <div className="flex flex-col h-screen">
      <section className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center justify-between w-full gap-2 md:gap-0 md:flex-row">
          <a
            href="https://github.com/Eth-Bangkok-MaiTai-Wallet/next-ai-sdk"
            title="onchainkit"
            target="_blank"
            rel="noreferrer"
          >
            <Image src="/test2.svg" alt="Material-UI Logo" width={100} height={100} />
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section className="flex-1 overflow-y-auto">
        <div className="flex flex-col w-full max-w-md mx-auto">
          {messages.map(m => {
            // console.log('Experimental Attachments:', m?.experimental_attachments);

            return (
              <div key={m.id} className="whitespace-pre-wrap text-left">
                {m.role !== 'system' && (m.role === 'user' ? 'User: ' : 'AI: ')}
                {m.role !== 'system' ? m.content : ''}
                <div>
                  {m?.experimental_attachments
                    ?.filter(attachment =>
                      attachment?.contentType?.startsWith('image/'),
                    )
                    .map((attachment, index) => (
                      <Image
                        key={`${m.id}-${index}`}
                        src={attachment.url}
                        width={500}
                        height={500}
                        alt={attachment.name ?? `attachment-${index}`}
                      />
                    ))}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>
      <section className="px-5 py-4">
        <form
          className="flex items-center w-full max-w-md mx-auto mb-4 space-x-2"
          onSubmit={event => {
            messages.push({
              role: 'system',
              content: JSON.stringify({ userAddress: address, chainId: chainId }),
              id: crypto.randomUUID(),
            });
            handleSubmit(event, {
              experimental_attachments: files,
            });

            setFiles(undefined);

            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        >
          <input
            className="w-full p-2 text-black text-left"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <input
            type="file"
            className="hidden"
            onChange={event => {
              if (event.target.files) {
                setFiles(event.target.files);
              }
            }}
            multiple
            ref={fileInputRef}
          />
        </form>
        {!isConnected || !transactions || transactions.length === 0 ? null : (
          <div className="w-full max-w-md mx-auto">
            <TransactionWrapper
              onStatus={() => {}}
              transactions={transactions}
              chainId={BASE_CHAIN_ID}
              disabled={false}
            />
          </div>
        )}
      </section>
    </div>
  );
}