'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChatContainer from '@/components/ChatContainer';
import FeatureSection from '@/components/FeatureSection';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';
import { GTM_Event_JoinWaitlistClicked } from '@/components/Tracking/Google/events';
import { featureSectionChatImageColumnClassName } from '@/lib/sectionLayout';

const Chat = () => {
  const sectionId: SectionId = 'chat';
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
      sectionClassName="border-b-nubly-blue border-b-1 bg-base-grey pb-6 md:pb-8"
      imagePosition="left"
      imageColumnClassName={featureSectionChatImageColumnClassName}
      image={<ChatContainer />}
      title={
        <>
          Tell Nubly the goal. <br /> We help move the money.
        </>
      }
      description={
        <>
          Nubly helps you create goals in everyday language, then supports the
          money movement behind them. <br />
          <br />
          Plan, save, invest, and stay on track through an experience that
          feels natural.
        </>
      }
      ctaId="join-waitlist-ai-chat"
      ctaVariant="yellow"
      onCtaClick={handleJoinWaitlistClick}
    />
  );
};

export default Chat;
