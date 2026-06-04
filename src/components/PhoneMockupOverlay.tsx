'use client';

import Image from 'next/image';
import { useInView } from '@/lib/hooks/useInView';
import type { MockupOverlayConfig } from '@/lib/mockupOverlays/types';
import { cn } from '@/lib/utils';
import {
  featureSectionMockupWrapperClassName,
  featureSectionOverlayImageClassName,
  featureSectionPhoneImageClassName,
  mockupOverlayLayerClassName,
  mockupSlotMotionBaseClassName,
} from '@/lib/sectionLayout';

const PhoneMockupOverlay = ({
  phoneSrc,
  phoneAlt,
  wrapperClassName,
  threshold = 0.6,
  rootMargin,
  once = false,
  cards,
}: MockupOverlayConfig) => {
  const { ref, isVisible } = useInView<HTMLDivElement>({
    threshold,
    rootMargin,
    once,
  });

  return (
    <div className={cn(featureSectionMockupWrapperClassName, wrapperClassName)} ref={ref}>
      <Image
        src={phoneSrc}
        alt={phoneAlt}
        width={400}
        height={400}
        className={featureSectionPhoneImageClassName}
      />
      <div className={mockupOverlayLayerClassName}>
        {cards.map((card) => (
          <div key={`${card.src}-${card.alt}`} className={card.slotClassName}>
            <div
              className={cn(
                mockupSlotMotionBaseClassName,
                isVisible
                  ? card.visibleMotionClassName
                  : card.hiddenMotionClassName,
              )}
              style={{ transitionDelay: isVisible ? `${card.delayMs ?? 0}ms` : '0ms' }}>
              <Image
                src={card.src}
                alt={card.alt}
                width={card.width}
                height={card.height}
                className={cn(featureSectionOverlayImageClassName, card.imageClassName)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhoneMockupOverlay;
