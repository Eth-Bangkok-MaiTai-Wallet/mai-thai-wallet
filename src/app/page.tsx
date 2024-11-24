'use client';

import { useChat } from 'ai/react';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';
import { useAccount } from 'wagmi';
import { useRef, useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const { address } = useAccount();
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-0">
          <a
            href="https://github.com/Eth-Bangkok-MaiTai-Wallet/next-ai-sdk"
            title="onchainkit"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/next.svg" alt="Material-UI Logo" style={{ width: '100px' }} />
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section>
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
          {messages.map(m => {
            // console.log('Experimental Attachments:', m?.experimental_attachments);

            return (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === 'user' ? 'User: ' : 'AI: '}
                {m.content}
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

          <form
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
            onSubmit={event => {
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
              type="file"
              className=""
              onChange={event => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            />
            <input
              className="w-full p-2 text-black"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
            />
          </form>
        </div>
      </section>
    </div>
  );
}