'use client';

import React from 'react';
import SavingsGoalCardsContainer from '@/components/SavingsGoalCardContainer';
import FeatureSection from '@/components/FeatureSection';
import { useRouter } from 'next/navigation';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Savings = () => {
  const sectionId: SectionId = 'savings';
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
      // sectionClassName="bg-base-grey border-b-nubly-blue border-b-1"
      sectionClassName="bg-light-blue border-b-nubly-blue border-b-1"
      imagePosition="right"
      image={<SavingsGoalCardsContainer />}
      title="Save before life absorbs it."
      description={
        <>
          Emergency fund. Rent buffer. A trip. A family expense. Something
          coming up soon. <br />
          <br />
          Nubly helps you automatically set aside money for short-term goals as
          income arrives, so saving does not depend on what is left over.
        </>
      }
      ctaId="join-waitlist-2"
      ctaVariant="blue"
      onCtaClick={handleJoinWaitlistClick}
    />
  );
};

export default Savings;
