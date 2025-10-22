import { SectionId } from '@/types';

type GTM_Event =
  | 'join_waitlist_clicked'
  | 'signup_form_submitted'
  | 'signup_form_cancelled';

export const GTM_Event_JoinWaitlistClicked = (sectionId: SectionId) => {
  const event: GTM_Event = 'join_waitlist_clicked';

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event,
      button_source: sectionId,
      page_section: sectionId,
    });
  } else {
    console.error(
      `GTM ERROR: window.dataLayer not found. Event: ${event} was not sent. `,
    );
  }
  return;
};

export const GTM_Event_SignupFormSubmitted = (
  source: SectionId | 'unknown',
) => {
  const event: GTM_Event = 'signup_form_submitted';

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event,
      button_source: source,
      page_section: source,
    });
  } else {
    console.error(
      `GTM ERROR: window.dataLayer not found. Event: ${event} was not sent. `,
    );
  }
};

export const GTM_Event_SignupFormCancelled = (
  source: SectionId | 'unknown',
) => {
  const event: GTM_Event = 'signup_form_cancelled';

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event,
      button_source: source,
      page_section: source,
    });
  } else {
    console.error(
      `GTM ERROR: window.dataLayer not found. Event: ${event} was not sent. `,
    );
  }
};
