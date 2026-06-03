'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import NotificationsCardContainer from '@/components/NotificationsCardContainer';
import FeatureSection from '@/components/FeatureSection';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';

const Notifications = () => {
  const sectionId: SectionId = 'notifications';
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
      sectionClassName="bg-light-blue border-b-nubly-blue border-b-1"
      imagePosition="right"
      image={<NotificationsCardContainer />}
      title="Stay on track without doing the math."
      description={
        <>
          Nubly reminds you when transfers are coming up, goals are reached, or
          your plan needs attention. <br />
          <br />
          As income changes, Nubly helps you keep moving.
        </>
      }
      ctaId="join-waitlist-4"
      ctaVariant="blue"
      onCtaClick={handleJoinWaitlistClick}
    />
  );
};

export default Notifications;
