'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvestingGoalCardsContainer from '@/components/InvestingGoalCardContainer';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Investing = () => {
  const sectionId: SectionId = 'investing';
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
      className="w-full border-b-nubly-yellow border-b-1 px-10 pt-15">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:order-1 md:px-10 md:pb-20">
          <h1 className="text-4xl md:pt-10 text-left font-extrabold text-nubly-blue mt-4">
            What about the long term?
          </h1>
          <h3 className="text-2xl pt-5 text-left">
            Your Nubly Portfolio takes the guesswork out of investing. We learn
            about you & with a click of a button money can be allocated to match
            your future plans.
            <br></br>
            <br></br>
            Now you can focus on living, we&apos;ll handle the rest!
          </h3>
          <button
            id="join-waitlist-3"
            className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl mt-8 w-full md:w-max hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
            onClick={handleJoinWaitlistClick}>
            Join waitlist
          </button>
        </div>

        <div className="flex flex-col items-center md:order-2 md:px-20 md:items-end">
          <InvestingGoalCardsContainer />
        </div>
      </div>
    </section>
  );
};

export default Investing;
