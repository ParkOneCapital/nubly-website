'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  featureSectionMockupWrapperClassName,
  featureSectionOverlayImageClassName,
  featureSectionPhoneImageClassName,
} from '@/lib/sectionLayout';

const InvestingGoalCardsContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefVisible, setIsRefVisible] = useState(false);

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          setIsRefVisible(true);
        } else {
          setIsRefVisible(false);
        }
      },
      { threshold: 0.6 },
    );

    const currentRef = containerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div className={`${featureSectionMockupWrapperClassName} lg:mt-0`}>
      <Image
        src="/assets/app_screen_investing.png"
        alt="Investing"
        width={400}
        height={400}
        className={featureSectionPhoneImageClassName}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <div
          ref={containerRef}
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  'translate-x-6 -translate-y-15 scale-100',
                  'lg:translate-x-10 lg:-translate-y-20 lg:scale-100',
                ].join(' ')
              : [
                  'translate-x-1 -translate-y-15 scale-95',
                  'lg:translate-x-0 lg:-translate-y-20 lg:scale-95',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/retirement_goal.png"
            alt="retirement_goal"
            width={350}
            height={350}
            className={featureSectionOverlayImageClassName}
          />
        </div>
        <div
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  '-translate-x-5 -translate-y-5 scale-100',
                  'lg:-translate-x-10 lg:-translate-y-5 lg:scale-100',
                ].join(' ')
              : [
                  'translate-x-0 translate-y-0 scale-95',
                  'lg:translate-x-0 lg:-translate-y-10 lg:scale-95',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/dream_car.png"
            alt="dream_car"
            width={350}
            height={350}
            className={`-mt-6 ${featureSectionOverlayImageClassName} lg:-mt-8`}
          />
        </div>
      </div>
    </div>
  );
};

export default InvestingGoalCardsContainer;
