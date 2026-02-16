'use client';

import React from 'react';
import SavingsGoalCardsContainer from '@/components/SavingsGoalCardContainer';
import { useRouter } from 'next/navigation';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Savings = () => {
  const sectionId: SectionId = 'savings';
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
      className="w-full bg-base-grey border-b-nubly-blue border-b-1 px-10 pt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:order-2 md:px-10 md:pb-20">
          <h1 className="text-4xl md:pt-10 text-left font-extrabold text-nubly-blue mt-4">
            Save for something soon-ish
            {/* Want something soon-ish? */}
            {/* <br></br>
            Start saving today. */}
          </h1>
          <h3 className="text-2xl pt-5 text-left">
            Whether you need to set aside cash for an emergency or go out with
            friends, having a Nubly fund allows you to begin saving now.
          </h3>
          <button
            id="join-waitlist-2"
            className="bg-nubly-blue text-white font-bold text-xl px-5 py-3 rounded-4xl mt-8 w-full md:w-max hover:bg-nubly-blue/80 active:bg-nubly-blue/60"
            onClick={handleJoinWaitlistClick}>
            Join waitlist
          </button>
        </div>

        <div className="flex flex-col items-center md:order-1 md:px-20 md:items-end">
          <SavingsGoalCardsContainer />
        </div>
      </div>
    </section>
  );
};

export default Savings;
