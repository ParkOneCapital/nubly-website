'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvestingGoalCardsContainer from '@/components/InvestingGoalCardContainer';

const Investing = () => {
  const router = useRouter();

  return (
    // <section className="w-full mt-10 md:pb-23 md:pt-20 border-b-nubly-yellow border-b-1">
    <section className="w-full border-b-nubly-yellow border-b-1 px-10 pt-15">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:order-1 md:px-10 md:pb-20">
          <h1 className="text-4xl md:pt-10 text-left font-extrabold text-nubly-blue mt-4">
            What about my long term goals?
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
            className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl mt-8 w-full md:w-max hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
            onClick={() => router.push('/join-waitlist')}>
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
