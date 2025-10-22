'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSectionAnalytics } from '@/components/Tracking/Google/hooks/useSectionAnalytics';
import { SectionId } from '@/types';

export const useScrollRouter = (sectionId: SectionId) => {
  const router = useRouter();
  const pathname = usePathname();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Track analytics
  useSectionAnalytics(sectionId, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);

          if (entry.isIntersecting) {
            // Only update if the hash is different
            const newHash = `#${sectionId}`;
            if (window.location.hash !== newHash) {
              // Use replace to avoid adding to history stack
              router.replace(`${pathname}${newHash}`, { scroll: false });
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of section is visible
        rootMargin: '-20% 0px -20% 0px', // Adjust sensitivity
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [router, pathname, sectionId]);

  // return sectionRef;
  return { ref: sectionRef, isVisible };
};
