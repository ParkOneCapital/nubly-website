'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  featureSectionMockupWrapperClassName,
  featureSectionOverlayImageClassName,
  featureSectionPhoneImageClassName,
} from '@/lib/sectionLayout';

const SavingsGoalCardsContainer = () => {
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
    <div className={featureSectionMockupWrapperClassName}>
      <Image
        src="/assets/app_screen_savings.png"
        alt="Savings"
        width={400}
        height={400}
        className={featureSectionPhoneImageClassName}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <div
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  '-translate-x-6 -translate-y-20 scale-100',
                  'lg:-translate-x-10 lg:-translate-y-30 lg:scale-100',
                ].join(' ')
              : [
                  'translate-x-0 -translate-y-20 scale-95',
                  'lg:translate-x-0 lg:-translate-y-24 lg:scale-95',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/emergency_fund.png"
            alt="emergency_fund"
            width={400}
            height={400}
            className={featureSectionOverlayImageClassName}
          />
        </div>
        <div
          ref={containerRef}
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  'translate-x-5 -translate-y-8 scale-100',
                  'lg:translate-x-12 lg:-translate-y-10 lg:scale-100',
                ].join(' ')
              : [
                  'translate-x-0 -translate-y-10 scale-95',
                  'lg:translate-x-0 lg:-translate-y-10 lg:scale-95',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/fancy_dinner_saving.png"
            alt="fancy_dinner_saving"
            width={400}
            height={400}
            className={`-mt-6 ${featureSectionOverlayImageClassName} lg:-mt-8`}
          />
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalCardsContainer;
