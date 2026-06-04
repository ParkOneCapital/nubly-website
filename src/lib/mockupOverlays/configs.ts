import type { MockupOverlayConfig } from '@/lib/mockupOverlays/types';

const mockupCardSlotClassName = 'absolute bottom-0 left-0 w-full';
const mockupSecondCardImageClassName = '-mt-3 md:-mt-4 lg:-mt-4';

export const savingsMockup: MockupOverlayConfig = {
  phoneSrc: '/assets/app_screen_savings.png',
  phoneAlt: 'Savings',
  cards: [
    {
      src: '/assets/emergency_fund.png',
      alt: 'Emergency fund goal',
      width: 400,
      height: 400,
      slotClassName: `${mockupCardSlotClassName} z-10`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-24 scale-95 md:-translate-y-26 lg:translate-x-0 lg:-translate-y-28 lg:scale-95',
      visibleMotionClassName:
        '-translate-x-7 -translate-y-30 scale-100 md:-translate-x-9 md:-translate-y-35 lg:-translate-x-10 lg:-translate-y-42 lg:scale-100',
      delayMs: 0,
    },
    {
      src: '/assets/fancy_dinner_saving.png',
      alt: 'Fancy dinner saving goal',
      width: 400,
      height: 400,
      slotClassName: `${mockupCardSlotClassName} z-20`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-6 scale-95 md:-translate-y-5 lg:translate-x-0 lg:-translate-y-6 lg:scale-95',
      visibleMotionClassName:
        'translate-x-7 -translate-y-8 scale-100 md:translate-x-9 md:-translate-y-10 lg:translate-x-12 lg:-translate-y-10 lg:scale-100',
      imageClassName: mockupSecondCardImageClassName,
      delayMs: 120,
    },
  ],
};

export const investingMockup: MockupOverlayConfig = {
  phoneSrc: '/assets/app_screen_investing.png',
  phoneAlt: 'Investing',
  wrapperClassName: 'lg:mt-0',
  cards: [
    {
      src: '/assets/retirement_goal.png',
      alt: 'Retirement goal',
      width: 350,
      height: 350,
      slotClassName: `${mockupCardSlotClassName} z-10`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-20 scale-95 md:-translate-y-24 lg:translate-x-0 lg:-translate-y-30 lg:scale-95',
      visibleMotionClassName:
        'translate-x-5 -translate-y-23 scale-100 md:translate-x-8 md:-translate-y-25 lg:translate-x-10 lg:-translate-y-30 lg:scale-100',
      delayMs: 0,
    },
    {
      src: '/assets/dream_car.png',
      alt: 'Dream car goal',
      width: 350,
      height: 350,
      slotClassName: `${mockupCardSlotClassName} z-20`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-3 scale-95 md:-translate-y-4 lg:translate-x-0 lg:-translate-y-6 lg:scale-95',
      visibleMotionClassName:
        '-translate-x-5 -translate-y-5 scale-100 md:-translate-x-8 md:-translate-y-4 lg:-translate-x-10 lg:-translate-y-5 lg:scale-100',
      imageClassName: mockupSecondCardImageClassName,
      delayMs: 120,
    },
  ],
};

export const notificationsMockup: MockupOverlayConfig = {
  phoneSrc: '/assets/app_screen_home_lock.png',
  phoneAlt: 'App screen home lock',
  cards: [
    {
      src: '/assets/notification_1.png',
      alt: 'Notification 1',
      width: 400,
      height: 400,
      slotClassName: `${mockupCardSlotClassName} z-10`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-30 scale-95 md:-translate-y-32 lg:translate-x-0 lg:-translate-y-40 lg:scale-95',
      visibleMotionClassName:
        '-translate-x-6 -translate-y-35 scale-100 md:-translate-x-8 md:-translate-y-40 lg:-translate-x-10 lg:-translate-y-50 lg:scale-100',
      delayMs: 0,
    },
    {
      src: '/assets/notification_2.png',
      alt: 'Notification 2',
      width: 400,
      height: 400,
      slotClassName: `${mockupCardSlotClassName} z-20`,
      hiddenMotionClassName:
        'translate-x-0 -translate-y-8 scale-95 md:-translate-y-9 lg:translate-x-0 lg:-translate-y-10 lg:scale-95',
      visibleMotionClassName:
        'translate-x-5 -translate-y-9 scale-100 md:translate-x-7 md:-translate-y-9 lg:translate-x-10 lg:-translate-y-12 lg:scale-100',
      imageClassName: mockupSecondCardImageClassName,
      delayMs: 120,
    },
  ],
};
