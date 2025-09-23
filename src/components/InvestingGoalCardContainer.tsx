'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';

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
    <div className="relative w-full flex items-center justify-center md:ml-20">
      <Image
        src="/assets/app_screen_investing.png"
        alt="Investing"
        width={400}
        height={400}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-85 md:pt-95">
        <div
          ref={containerRef}
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  // mobile base
                  'translate-x-6 -translate-y-7 scale-100',
                  // tablet / desktop base
                  'md:translate-x-6 md:-translate-y-4 md:scale-100',
                  'lg:translate-x-10 lg:-translate-y-10 lg:scale-100',
                ].join(' ')
              : [
                  // mobile base
                  'translate-x-0 -translate-y-4 scale-90',
                  // tablet / desktop base
                  'md:translate-x-1 md:-translate-y-8 md:scale-1.5',
                  'lg:scale-90',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/retirement_goal.png"
            alt="retirement_goal"
            width={350}
            height={350}
            className="md:mt-10"
          />
        </div>
        <div
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  // mobile base
                  '-translate-x-5 translate-y-1 scale-100',
                  // tablet / desktop base
                  'md:-translate-x-10 md:translate-y-10 md:scale-90',
                  'lg:-translate-x-15 lg:translate-y-10 lg:scale-105',
                ].join(' ')
              : [
                  // mobile base
                  'translate-x-0 -translate-y-0 scale-90',
                  // tablet / desktop base
                  'md:translate-x-6 md:-translate-y-4 md:scale-85',
                  'lg:translate-x-1 lg:translate-y-5 lg:scale-90',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/dream_car.png"
            alt="dream_car"
            width={350}
            height={350}
            className="-mt-5 md:-mt-15"
          />
        </div>
      </div>
    </div>
  );
};

export default InvestingGoalCardsContainer;
