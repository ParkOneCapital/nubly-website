'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InvestingGoalCardsContainer from '@/components/InvestingGoalCardContainer';
import FeatureSection from '@/components/FeatureSection';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Investing = () => {
  const sectionId: SectionId = 'investing';
  const router = useRouter();
  const sectionRef = useScrollRouter(sectionId);

  const handleJoinWaitlistClick = async () => {
    GTM_Event_JoinWaitlistClicked(sectionId);
    router.push(`/join-waitlist?source=${sectionId}`);
  };

  return (
    <FeatureSection
      sectionId={sectionId}
      sectionRef={sectionRef.ref}
      sectionClassName="border-b-nubly-yellow border-b-1 pt-15"
      imagePosition="left"
      image={<InvestingGoalCardsContainer />}
      title="Invest from every paycheck."
      description={
        <>
          Nubly helps route money toward long-term investing goals before
          spending decisions take over. <br />
          <br />
          Set your plan, and let long-term progress happen in the background.
        </>
      }
      ctaId="join-waitlist-3"
      ctaVariant="yellow"
      onCtaClick={handleJoinWaitlistClick}
    />
  );
};

export default Investing;
