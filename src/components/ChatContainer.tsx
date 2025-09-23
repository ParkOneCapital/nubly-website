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
        'transition-all duration-1000 ease-out motion-reduce:transition-none will-change-transform',
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
    <div className="p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <div className="space-y-5">
          {/* AI Message 1 */}
          <RevealOnScroll className="flex justify-start">
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg max-w-[80%] border border-nubly-yellow">
              <p>Hi! I&apos;m Nubly. What&apos;s your goal?</p>
            </div>
          </RevealOnScroll>

          {/* User Message */}
          <RevealOnScroll className="flex justify-end">
            <div className="bg-nubly-blue text-white px-3 py-2 rounded-lg max-w-[80%]">
              <p>
                I would like to save for my mother&apos;s fancy birthday dinner
                in 2 months.
              </p>
            </div>
          </RevealOnScroll>

          {/* AI Message 2 */}
          <RevealOnScroll className="flex justify-start">
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg max-w-[80%] border border-nubly-yellow">
              <p>
                That&apos;s a beautiful gesture! How much do you want to save?
              </p>
            </div>
          </RevealOnScroll>

          {/* User Message - Amount */}
          <RevealOnScroll className="flex justify-end">
            <div className="bg-nubly-blue text-white px-3 py-2 rounded-lg max-w-[80%]">
              <p>$350</p>
            </div>
          </RevealOnScroll>

          {/* AI Message 3 - Goal Created */}
          <RevealOnScroll className="flex justify-start">
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg max-w-[90%] border border-nubly-yellow">
              <p>Excellent! Your goal has been created.</p>

              <Image
                src="/assets/mothers_dinner.png"
                alt="Mother's dinner"
                width={500}
                height={500}
                className="pt-3"
              />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
