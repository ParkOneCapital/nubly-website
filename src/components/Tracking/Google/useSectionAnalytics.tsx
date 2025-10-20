// hooks/useSectionAnalytics.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SectionId } from '@/types';

interface SectionView {
  sectionId: string;
  entryTime: number;
  exitTime?: number;
  duration?: number;
}

export const useSectionAnalytics = (
  sectionId: SectionId,
  isVisible: boolean,
) => {
  const entryTimeRef = useRef<number | null>(null);
  const viewDataRef = useRef<SectionView | null>(null);

  const sendAnalytics = useCallback((data: SectionView) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        // 'event' is a special key that GTM uses for triggers.
        event: `section_view_${sectionId}`,

        // The rest of your data is passed along in the same object.
        section_id: data.sectionId,
        duration_ms: data.duration,
        entry_time: data.entryTime,
        exit_time: data.exitTime,
      });
    } else {
      console.error(
        'GTM ERROR: window.dataLayer not found. Analytics event was not sent.',
      );
    }
  }, []);

  useEffect(() => {
    if (isVisible && !entryTimeRef.current) {
      // Section became visible
      entryTimeRef.current = Date.now();
      viewDataRef.current = {
        sectionId,
        entryTime: entryTimeRef.current,
      };
    } else if (!isVisible && entryTimeRef.current) {
      // Section became invisible
      const exitTime = Date.now();
      const duration = exitTime - entryTimeRef.current;

      if (viewDataRef.current) {
        viewDataRef.current.exitTime = exitTime;
        viewDataRef.current.duration = duration;
        sendAnalytics(viewDataRef.current);
      }

      entryTimeRef.current = null;
      viewDataRef.current = null;
    }
  }, [isVisible, sectionId, sendAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (entryTimeRef.current && viewDataRef.current) {
        const exitTime = Date.now();
        const duration = exitTime - entryTimeRef.current;
        viewDataRef.current.exitTime = exitTime;
        viewDataRef.current.duration = duration;
        sendAnalytics(viewDataRef.current);
      }
    };
  }, [sendAnalytics]);
};
