'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  featureSectionContentClassName,
  featureSectionCtaClassNames,
  featureSectionImageColumnClassName,
  featureSectionImageOrderWhenImageLeftClassName,
  featureSectionImageOrderWhenImageRightClassName,
  featureSectionBodyClassName,
  featureSectionHeadingClassName,
  featureSectionShellClassName,
  featureSectionTextColumnClassName,
  featureSectionTextOrderWhenImageLeftClassName,
  featureSectionTextOrderWhenImageRightClassName,
  type FeatureSectionCtaVariant,
} from '@/lib/sectionLayout';
import { SectionId } from '@/types';

type FeatureSectionProps = {
  sectionId: SectionId;
  sectionRef: React.RefObject<HTMLElement | null>;
  sectionClassName?: string;
  imagePosition: 'left' | 'right';
  image: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  ctaId: string;
  ctaVariant: FeatureSectionCtaVariant;
  onCtaClick: () => void;
  imageColumnClassName?: string;
};

const FeatureSection = ({
  sectionId,
  sectionRef,
  sectionClassName,
  imagePosition,
  image,
  title,
  description,
  ctaId,
  ctaVariant,
  onCtaClick,
  imageColumnClassName,
}: FeatureSectionProps) => {
  const imageOnLeft = imagePosition === 'left';

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={cn(featureSectionShellClassName, sectionClassName)}>
      <div className={featureSectionContentClassName}>
        <div
          className={cn(
            featureSectionTextColumnClassName,
            imageOnLeft
              ? featureSectionTextOrderWhenImageLeftClassName
              : featureSectionTextOrderWhenImageRightClassName,
          )}>
          <h1 className={featureSectionHeadingClassName}>{title}</h1>
          <h3 className={featureSectionBodyClassName}>{description}</h3>
          <button
            id={ctaId}
            className={featureSectionCtaClassNames[ctaVariant]}
            onClick={onCtaClick}>
            Join waitlist
          </button>
        </div>

        <div
          className={cn(
            imageColumnClassName ?? featureSectionImageColumnClassName,
            imageOnLeft
              ? featureSectionImageOrderWhenImageLeftClassName
              : featureSectionImageOrderWhenImageRightClassName,
          )}>
          {image}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
