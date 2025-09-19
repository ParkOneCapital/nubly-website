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

              {/* <div className="mt-2 border border-cyan-200 rounded-lg flex items-stretch overflow-hidden">
                <div className="bg-cyan-600 p-3 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V5.454c0-.523.151-1.046.454-1.5a2.704 2.704 0 010-3 2.704 2.704 0 000-3c.303-.454.523-.977.454-1.5H15.546c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v10.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
                <div className="flex-grow flex justify-between items-center p-3 text-sm">
                  <span>Mom&apos;s fancy birthdday dinner</span>
                  <span className="font-bold">$350</span>
                </div>
              </div> */}
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
