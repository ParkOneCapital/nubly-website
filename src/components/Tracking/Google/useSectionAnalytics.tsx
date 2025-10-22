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
  const accumulatedDurationRef = useRef<number>(0);
  const isPageVisibleRef = useRef<boolean>(true);
  const wasSectionVisibleRef = useRef<boolean>(false);

  const sendAnalytics = useCallback(
    (data: SectionView) => {
      // Google Analytics 4
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          // 'event' is a special key that GTM uses for triggers.
          event: `section_view_${sectionId}`,
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
    },
    [sectionId],
  );

  // Handle pausing/resuming tracking when page visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (typeof document === 'undefined') return;

    const isPageVisible = !document.hidden;
    const wasPageVisible = isPageVisibleRef.current;
    isPageVisibleRef.current = isPageVisible;

    // Only process if section is currently visible
    if (wasSectionVisibleRef.current) {
      if (!isPageVisible && wasPageVisible) {
        // Page just became hidden (tab switch, minimize, etc.) - pause tracking
        if (entryTimeRef.current) {
          const pauseTime = Date.now();
          const sessionDuration = pauseTime - entryTimeRef.current;
          accumulatedDurationRef.current += sessionDuration;

          // Clear entry time to stop tracking (but don't send analytics yet)
          entryTimeRef.current = null;
        }
      } else if (isPageVisible && !wasPageVisible) {
        // Page just became visible again - resume tracking
        // Restart the timer
        entryTimeRef.current = Date.now();

        // Keep the same viewDataRef to maintain the original entry time
        if (!viewDataRef.current) {
          viewDataRef.current = {
            sectionId,
            entryTime: Date.now(),
          };
        }
      }
    }
  }, [sectionId]);

  // Track section visibility changes
  useEffect(() => {
    const isPageVisible = isPageVisibleRef.current;

    if (isVisible) {
      wasSectionVisibleRef.current = true;

      // Section became visible
      if (isPageVisible && !entryTimeRef.current) {
        // Only start tracking if page is actually visible
        entryTimeRef.current = Date.now();

        // Only create new view data if we don't have one (new section view)
        if (!viewDataRef.current) {
          viewDataRef.current = {
            sectionId,
            entryTime: entryTimeRef.current,
          };
          accumulatedDurationRef.current = 0;
        }
      }
    } else if (!isVisible && wasSectionVisibleRef.current) {
      // Section became invisible - send final analytics
      wasSectionVisibleRef.current = false;

      if (entryTimeRef.current) {
        const exitTime = Date.now();
        const sessionDuration = exitTime - entryTimeRef.current;
        const totalDuration = accumulatedDurationRef.current + sessionDuration;

        if (viewDataRef.current) {
          sendAnalytics({
            ...viewDataRef.current,
            exitTime: exitTime,
            duration: totalDuration,
          });
        }
      } else if (accumulatedDurationRef.current > 0) {
        // Edge case: section became invisible while page was hidden
        if (viewDataRef.current) {
          sendAnalytics({
            ...viewDataRef.current,
            exitTime: Date.now(),
            duration: accumulatedDurationRef.current,
          });
        }
      }

      // Reset all tracking state
      entryTimeRef.current = null;
      viewDataRef.current = null;
      accumulatedDurationRef.current = 0;
    }
  }, [isVisible, sectionId, sendAnalytics]);

  // Add visibility change listener
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Cleanup on unmount or before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (entryTimeRef.current && viewDataRef.current) {
        const exitTime = Date.now();
        const sessionDuration = exitTime - entryTimeRef.current;
        const totalDuration = accumulatedDurationRef.current + sessionDuration;

        sendAnalytics({
          ...viewDataRef.current,
          exitTime: exitTime,
          duration: totalDuration,
        });
      } else if (accumulatedDurationRef.current > 0 && viewDataRef.current) {
        // Page was hidden when closing
        sendAnalytics({
          ...viewDataRef.current,
          exitTime: Date.now(),
          duration: accumulatedDurationRef.current,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Component unmount cleanup
      if (entryTimeRef.current && viewDataRef.current) {
        const exitTime = Date.now();
        const sessionDuration = exitTime - entryTimeRef.current;
        const totalDuration = accumulatedDurationRef.current + sessionDuration;

        sendAnalytics({
          ...viewDataRef.current,
          exitTime: exitTime,
          duration: totalDuration,
        });
      } else if (accumulatedDurationRef.current > 0 && viewDataRef.current) {
        sendAnalytics({
          ...viewDataRef.current,
          exitTime: Date.now(),
          duration: accumulatedDurationRef.current,
        });
      }
    };
  }, [sendAnalytics, sectionId]);
};
