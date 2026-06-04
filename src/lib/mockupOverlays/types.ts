export type MockupOverlayCard = {
  src: string;
  alt: string;
  width: number;
  height: number;
  slotClassName: string;
  hiddenMotionClassName: string;
  visibleMotionClassName: string;
  delayMs?: number;
  imageClassName?: string;
};

export type MockupOverlayConfig = {
  phoneSrc: string;
  phoneAlt: string;
  wrapperClassName?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  cards: MockupOverlayCard[];
};
