'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

type UseInViewResult<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  isVisible: boolean;
};

export const useInView = <T extends HTMLElement>({
  threshold = 0.6,
  rootMargin,
  once = false,
}: UseInViewOptions = {}): UseInViewResult<T> => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, rootMargin, threshold]);

  return { ref, isVisible };
};
