'use client';

import dotenv from 'dotenv';
dotenv.config();

import { useChat } from 'ai/react';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';
import { useAccount } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import TransactionWrapper from '@/components/TransactionWrapper';
import { BASE_CHAIN_ID, SEPOLIA_CHAIN_ID, HOLESKY_CHAIN_ID, MAINNET_CHAIN_ID } from '@/constants';
import { Transaction } from '@/lib/utils';
import { Message } from './api/(get_endpoints)/get_transcript/route';
import { border, cn, pressable, text } from '@coinbase/onchainkit/theme';
import ViemEVMSignButton from '@/components/ViemEVMSignButton';
import { kv } from '@vercel/kv';
import { EVMTransaction } from "@goat-sdk/wallet-evm";
import {Popup} from '@/components/Popup'

export default function Chat() {
  const { address, chainId, isConnected } = useAccount();
  const { isLoading, messages, input, append, handleInputChange, handleSubmit } = useChat();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [crossmintTxs, setCrossmintTxs] = useState<EVMTransaction[]>([]);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceIntents, setVoiceIntents] = useState<Message[]>([]);
  const [count, setCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

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
  
  useEffect(() => {
    fetchTransaction();
  }, [isLoading]);

  // useEffect(() => {
  //   const fetchVoiceIntents = async () => {
  //     try {
  //       const response = await fetch('/api/get_transcript');
  //       const voiceIntents = await response.json();
  //       console.log("Voice intents: ", voiceIntents)

  //       if(voiceIntents){
  //         setVoiceIntents(voiceIntents)
  //       }
  //     } catch (error) {
  //       console.error("Error fetching transaction:", error);
  //     }
  //   };
  
  //   fetchVoiceIntents();
  //   const intervalId = setInterval(fetchVoiceIntents, 5000);
  
  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {

    const fetchCrossmintTxs = async () => { 
      const response = await fetch('/api/retrieve_crossmint_tx');
      const data = await response.json();
      console.log("Crossmint transactions: ", data.transactions);
      if(data.transactions){
        setCrossmintTxs(data.transactions as EVMTransaction[]);
      }
    };

    fetchCrossmintTxs();

    const timer = setTimeout(() => {
      console.log("30 seconds have passed");
      setCount(count+1)
    }, 30000)
    return () => clearTimeout(timer)

  }, [count]);

  useEffect(() => {
    if (crossmintTxs.length != 0) {
      setShowPopup(true);
      console.log("crossmintTxs: ", crossmintTxs)
    }
  }, [count]); //

  const handleVoiceIntents = async () => {
    try{
      fetch('/api/clear_intents', {
        method: "POST"
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }

    for (const intent of voiceIntents) {
      append({role: intent.role as "system" | "user" | "assistant", content: intent.content, id: crypto.randomUUID()});
    }

    setVoiceIntents([]);
  }

  const handleApprove = async () => {
    // await kv.set("approval", "true");
    setShowPopup(false);
  }

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
            // messages.push({
            //   role: 'system',
            //   content: JSON.stringify({ userAddress: address, chainId: chainId }),
            //   id: crypto.randomUUID(),
            // });

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
          {/* <button 
            disabled={!voiceIntents || voiceIntents.length === 0} 
            className={`rounded-md px-4 py-2 ${!voiceIntents || voiceIntents.length === 0 ? 'bg-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`} 
            onClick={handleVoiceIntents}
          >Execute voice intents</button> */}
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
          <div className="w-full max-w-md mx-auto flex flex-row">
            <TransactionWrapper
              onStatus={() => {}}
              transactions={transactions}
              chainId={MAINNET_CHAIN_ID}
              disabled={!isConnected || !transactions || transactions.length === 0}
            />
            <button 
              className={cn(
                pressable.primary,
                border.radius,
                'w-full rounded-xl',
                'px-4 py-3 font-medium text-base text-white leading-6',
                (!voiceIntents || voiceIntents.length === 0) && pressable.disabled,
                text.headline,
                'mt-0 ml-3 mr-auto',
              )}
              disabled={!voiceIntents || voiceIntents.length === 0} 
              // className={`rounded-md px-4 py-3 w-full mt-0 ml-3 mr-auto ${!voiceIntents || voiceIntents.length === 0 ? 'bg-gray-300' : 'bg-blue-300 text-white hover:bg-blue-600'} ${!voiceIntents || voiceIntents.length && pressable.disabled}`} 
              style={{ width: '300px', height: '48px' }} 
              onClick={handleVoiceIntents}
            >Execute voice intents</button>
          </div>
          <div className="flex flex-col space-y-4">
            <ViemEVMSignButton />
          </div>
          <Popup 
            isOpen={showPopup} 
            onClose={() => setShowPopup(false)}
            title="Example Popup"
            position="center"
            handleApprove={handleApprove}
          >
            <div>
              {crossmintTxs.map((tx, index) => (
                <div key={index}>
                  <p>Transaction {index}</p>
                  <p>to: {tx.to}</p>
                  <p>functionName: {tx.functionName}</p>
                  <p>args: {tx.args?.toString()}</p>
                  <p>value: {tx.value}</p>
                </div>
              ))}
            </div>  
          </Popup>
      </section>
    </div>
  );
}