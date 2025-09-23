'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';

const NotificationsCardContainer = () => {
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
    <div className="relative w-full flex justify-center mt-5">
      <Image
        src="/assets/app_screen_home_lock.png"
        alt="App screen home lock"
        width={400}
        height={400}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-50 md:pt-50">
        <div
          ref={containerRef}
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  // mobile base
                  '-translate-x-6 -translate-y-2 scale-100',
                  // tablet / desktop base
                  'md:-translate-x-3 md:-translate-y-3 md:scale-100',
                  'lg:-translate-x-16 lg:-translate-y-10 lg:scale-105',
                ].join(' ')
              : [
                  // mobile base
                  'translate-x-0 translate-y-0 scale-90',
                  // tablet / desktop base
                  // 'md:scale-95',
                  'md:translate-x-6 md:-translate-y-4 md:scale-100',
                  'lg:translate-x-1 lg:-translate-y-8 lg:scale-90',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/notification_1.png"
            alt="Notification 1"
            width={400}
            height={400}
            className="md:mt-10"
          />
        </div>
        <div
          className={[
            'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            isRefVisible
              ? [
                  // mobile base
                  'translate-x-5 translate-y-5 scale-100',
                  // tablet / desktop base
                  'md:translate-x-10 md:translate-y-10 md:scale-100',
                  'lg:translate-x-16 lg:translate-y-10 lg:scale-105',
                ].join(' ')
              : [
                  // mobile base
                  'translate-x-0 translate-y-0 scale-90',
                  // tablet / desktop base
                  'md:translate-x-6 md:-translate-y-4 md:scale-100',
                  'lg:translate-x-1 lg:translate-y-10 lg:scale-90',
                ].join(' '),
          ].join(' ')}>
          <Image
            src="/assets/notification_2.png"
            alt="Notification 2"
            width={400}
            height={400}
            className="md:-mt-10"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsCardContainer;
