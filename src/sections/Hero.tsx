'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';
import { featureSectionContentClassName } from '@/lib/sectionLayout';

const Hero = () => {
  const sectionId: SectionId = 'home';
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
      className="w-full px-2 mb-8 lg:my-20">
      <div className={`${featureSectionContentClassName} p-8`}>
        <div className="mb-8 w-full text-left lg:mb-0 lg:max-w-[520px] lg:flex-none lg:px-6 xl:max-w-[560px]">
          <div className="max-w-xl text-left items-start">
            <Image
              src="/assets/logos/blue_nubly.png"
              alt="Nubly"
              width={100}
              height={100}
            />
            <h1 className="text-5xl lg:text-6xl text-left font-extrabold text-nubly-blue mt-4 font">
              Your paycheck, <br />
              automatically put to work
            </h1>
            <h3 className="mt-5 text-left text-2xl text-pretty">
              Nubly safely moves money from each paycheck into savings and
              investing goals before&nbsp;you&nbsp;spend&nbsp;it.
            </h3>
            <button
              id="join-waitlist-1"
              className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl w-max mt-8 hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
              onClick={handleJoinWaitlistClick}>
              Join waitlist
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] shrink-0 lg:mx-0 lg:flex-none xl:max-w-[600px]">
          <Image
            src="/assets/hero_goal_images.png"
            alt="Savings and investing goal cards"
            width={2152}
            height={1836}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
