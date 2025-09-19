'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatContainer from '@/components/ChatContainer';

const Chat = () => {
  const router = useRouter();

  return (
    <section className="w-full border-b-nubly-blue border-b-1 px-10 pt-10 bg-base-grey">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:order-2 md:px-10 md:pb-20">
          <h1 className="text-4xl md:pt-10 text-left font-extrabold text-nubly-blue mt-4">
            Save and invest - with a friendly AI coach by your side.
          </h1>
          <h3 className="text-2xl pt-5 text-left">
            Nubly helps anyone build money goals — even on a tight budget. Open
            an interest-earning savings account or a simple investment account.
            Our chat explains everything in everyday words and keeps you on
            track.
          </h3>
          <button
            className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl mt-8 w-full md:w-max hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
            onClick={() => router.push('/join-waitlist')}>
            Join waitlist
          </button>
        </div>

        <div className="md:w-1/2 flex flex-col items-center md:order-1 md:px-20 pb-10 md:items-end">
          <ChatContainer />
        </div>
      </div>
    </section>
  );
};

export default Chat;
