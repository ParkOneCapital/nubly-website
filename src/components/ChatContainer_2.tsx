'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  threshold?: number;
};

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className,
  once = false,
  threshold = 0.9,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        'transition-all duration-1500 ease-out motion-reduce:transition-none will-change-transform',
        isVisible
          ? 'blur-0 opacity-100 translate-y-0'
          : 'blur-sm opacity-0 translate-y-4',
      )}>
      {children}
    </div>
  );
};

const ChatContainer = () => {
  return (
    <div className="w-full">
      <div className="space-y-3">
        {/* AI Message 1 */}
        <RevealOnScroll className="flex justify-start">
          <div className="text-gray-800 text-xs">
            {/* <p>Hi! I&apos;m Nubly. What&apos;s your goal?</p> */}
            <p>
              Awesome! This is the right step to reaching your goals. What are
              you saving for?
            </p>
          </div>
        </RevealOnScroll>

        {/* User Message */}
        <RevealOnScroll className="flex justify-end">
          <div className="bg-white text-gray-800 text-xs px-3 py-2 rounded-sm max-w-[80%]">
            <p>
              I would like to save for my mother&apos;s fancy birthday dinner in
              2 months.
            </p>
          </div>
        </RevealOnScroll>

        {/* AI Message 2 */}
        <RevealOnScroll className="flex justify-start">
          <div className="text-gray-800 text-xs">
            <p>
              That&apos;s a beautiful gesture! How much do you want to save?
            </p>
          </div>
        </RevealOnScroll>

        {/* User Message - Amount */}
        <RevealOnScroll className="flex justify-end">
          <div className="bg-white text-gray-800 text-xs px-3 py-2 rounded-sm max-w-[80%]">
            <p>$350</p>
          </div>
        </RevealOnScroll>

        {/* AI Message 3 - Goal Created */}
        <RevealOnScroll className="flex justify-start">
          <div className="text-gray-800 text-xs">
            <p>Excellent! Your goal has been created.</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="flex justify-start">
          <Image
            src="/assets/mothers_dinner.png"
            alt="Mother's dinner"
            width={500}
            height={500}
          />
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default ChatContainer;
