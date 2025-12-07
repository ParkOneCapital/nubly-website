'use client';

import { useEffect, useRef, useCallback } from 'react';

// Interface for the data being tracked for a single FAQ
interface FaqViewData {
  faqId: string;
  entryTime: number;
  accumulatedDuration: number;
}

// Interface for the hook's props
interface UseFaqAnalyticsProps {
  isSectionVisible: boolean; // Is the parent FAQ section in the viewport?
  activeFaqValue: string | undefined; // The 'value' of the currently open accordion item
}

export const useFaqAnalytics = ({
  isSectionVisible,
  activeFaqValue,
}: UseFaqAnalyticsProps) => {
  // Ref to store the tracking data for the currently open FAQ
  const activeFaqTrackerRef = useRef<FaqViewData | null>(null);
  // Ref to track the previous active FAQ to know when one closes
  const previousActiveFaqRef = useRef<string | undefined>(undefined);
  // Ref to track page visibility (tab active or not)
  const isPageVisibleRef = useRef<boolean>(true);

  // Function to send data to GTM
  const sendFaqAnalytics = useCallback((faqId: string, duration: number) => {
    if (duration < 1000) return; // Optional: Don't send events for very short views

    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'faq_view', // A new custom event for GTM
        faq_id: faqId,
        duration_ms: Math.round(duration),
      });
    } else {
      console.error(
        'GTM ERROR: window.dataLayer not found. Analytics event was not sent.',
      );
    }
  }, []);

  // Finalize and send data for the currently tracked FAQ
  const finalizeAndSend = useCallback(() => {
    if (!activeFaqTrackerRef.current) return;

    const { faqId, entryTime, accumulatedDuration } =
      activeFaqTrackerRef.current;
    let finalDuration = accumulatedDuration;

    // If the timer was running, add the last session's duration
    if (entryTime !== 0) {
      finalDuration += Date.now() - entryTime;
    }

    sendFaqAnalytics(faqId, finalDuration);
    // Reset the tracker
    activeFaqTrackerRef.current = null;
  }, [sendFaqAnalytics]);

  // Main effect to handle opening/closing of FAQs
  useEffect(() => {
    const previousFaq = previousActiveFaqRef.current;

    // A different FAQ is now active, or the active one was closed
    if (previousFaq && previousFaq !== activeFaqValue) {
      finalizeAndSend();
    }

    // A new FAQ has been opened
    if (activeFaqValue && isSectionVisible && isPageVisibleRef.current) {
      // Start tracking the new active FAQ if it's not already being tracked
      if (
        !activeFaqTrackerRef.current ||
        activeFaqTrackerRef.current.faqId !== activeFaqValue
      ) {
        activeFaqTrackerRef.current = {
          faqId: activeFaqValue,
          entryTime: Date.now(),
          accumulatedDuration: 0,
        };
      }
    }

    // Update the ref for the next render
    previousActiveFaqRef.current = activeFaqValue;
  }, [activeFaqValue, isSectionVisible, finalizeAndSend]);

  // Effect to handle pausing/resuming when scrolling the section in/out of view
  useEffect(() => {
    if (!activeFaqValue) return; // Do nothing if no FAQ is open

    if (isSectionVisible) {
      // Section is visible: RESUME timer
      // Ensure we have a tracker and its timer is paused (entryTime is 0)
      if (
        activeFaqTrackerRef.current &&
        activeFaqTrackerRef.current.entryTime === 0
      ) {
        activeFaqTrackerRef.current.entryTime = Date.now();
      }
    } else {
      // Section is not visible: PAUSE timer
      // Ensure we have a tracker and its timer is running
      if (
        activeFaqTrackerRef.current &&
        activeFaqTrackerRef.current.entryTime !== 0
      ) {
        const pauseTime = Date.now();
        activeFaqTrackerRef.current.accumulatedDuration +=
          pauseTime - activeFaqTrackerRef.current.entryTime;
        activeFaqTrackerRef.current.entryTime = 0; // Mark as paused
      }
    }
  }, [isSectionVisible, activeFaqValue]);

  // Effect to handle pausing/resuming when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isPageVisible = !document.hidden;
      isPageVisibleRef.current = isPageVisible;

      if (!activeFaqTrackerRef.current) return; // No FAQ open

      if (!isPageVisible && activeFaqTrackerRef.current.entryTime !== 0) {
        // Page hidden: PAUSE timer
        const pauseTime = Date.now();
        activeFaqTrackerRef.current.accumulatedDuration +=
          pauseTime - activeFaqTrackerRef.current.entryTime;
        activeFaqTrackerRef.current.entryTime = 0; // Mark as paused
      } else if (
        isPageVisible &&
        activeFaqTrackerRef.current.entryTime === 0 &&
        isSectionVisible
      ) {
        // Page visible: RESUME timer (only if the section is also visible)
        activeFaqTrackerRef.current.entryTime = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSectionVisible]);

  // Effect to send data when the user leaves the page
  useEffect(() => {
    window.addEventListener('beforeunload', finalizeAndSend);
    return () => {
      window.removeEventListener('beforeunload', finalizeAndSend);
      // Final cleanup on component unmount
      finalizeAndSend();
    };
  }, [finalizeAndSend]);
};
