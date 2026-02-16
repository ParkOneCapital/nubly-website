'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatContainer from '@/components/ChatContainer';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Chat = () => {
  const sectionId: SectionId = 'chat';
  const router = useRouter();
  const sectionRef = useScrollRouter(sectionId);

  const handleJoinWaitlistClick = async () => {
    // Send GTM event
    GTM_Event_JoinWaitlistClicked(sectionId);
    router.push(`/join-waitlist?source=${sectionId}`);
  };

  return (
    <section
      id={sectionId}
      ref={sectionRef.ref}
      className="w-full border-b-nubly-blue border-b-1 px-10 pt-10 bg-base-grey">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:order-2 md:px-10 md:pb-20">
          <h1 className="text-4xl md:pt-10 text-left font-extrabold text-nubly-blue mt-4">
            Plan, save, invest.
          </h1>
          <h3 className="text-2xl pt-5 text-left">
            Nubly intelligently helps anyone build money goals, even tight
            budgets. Our chat not only saves & invests for you but, it explains
            finance in everyday words. All to help you stay in control and{' '}
            <span className="text-nubly-green">live your best life</span>.
          </h3>
          <button
            id="join-waitlist-ai-chat"
            className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl mt-8 w-full md:w-max hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
            onClick={handleJoinWaitlistClick}>
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
