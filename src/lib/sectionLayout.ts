/** Shared max-width wrapper for two-column sections (copy + phone mockup). */
export const featureSectionContentClassName =
  'mx-auto flex w-full max-w-section flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-10 xl:gap-14';

/** @deprecated Use featureSectionContentClassName */
export const featureSectionContentEndClassName = featureSectionContentClassName;

/** @deprecated Use featureSectionContentClassName */
export const featureSectionContentCenterClassName = featureSectionContentClassName;

export const featureSectionTextColumnClassName =
  'mb-8 w-full text-left lg:mb-0 lg:max-w-[520px] lg:flex-none lg:self-center lg:px-6 xl:max-w-[560px]';

export const featureSectionImageColumnClassName =
  'flex w-full shrink-0 flex-col items-center overflow-visible lg:w-auto lg:flex-none lg:items-end lg:self-end lg:px-4';

export const featureSectionMockupWrapperClassName =
  'relative mx-auto mt-5 flex w-max max-w-full shrink-0 items-end justify-end lg:mx-0 lg:mt-0 lg:ml-auto';

/** Chat mockup is vertically centered with breathing room (not bottom-anchored). */
export const featureSectionChatImageColumnClassName =
  'flex w-full shrink-0 flex-col items-center overflow-visible py-10 lg:w-auto lg:flex-none lg:self-center lg:px-4 lg:py-14';

export const featureSectionChatMockupWrapperClassName =
  'relative mx-auto mt-5 flex w-max max-w-full shrink-0 lg:mx-0 lg:mt-0 lg:ml-auto';

export const featureSectionPhoneImageClassName =
  'block h-auto w-[280px] shrink-0 sm:w-[320px] lg:w-[400px]';

export const featureSectionOverlayImageClassName = 'h-auto w-full shrink-0';
export const mockupOverlayLayerClassName = 'pointer-events-none absolute inset-0';
export const mockupSlotMotionBaseClassName =
  'transform transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100';

export const faqSectionContentClassName = 'mx-auto w-full max-w-3xl';

export const featureSectionShellClassName = 'w-full px-10 pt-10';

export const featureSectionHeadingClassName =
  'mt-4 text-4xl text-left font-extrabold text-nubly-blue';

export const featureSectionBodyClassName = 'pt-5 text-left text-2xl';

export const featureSectionCtaBlueClassName =
  'mt-8 w-full rounded-4xl bg-nubly-blue px-5 py-3 text-xl font-bold text-white hover:bg-nubly-blue/80 active:bg-nubly-blue/60 lg:w-max';

export const featureSectionCtaYellowClassName =
  'mt-8 w-full rounded-4xl bg-nubly-yellow px-5 py-3 text-xl font-bold text-black hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60 lg:w-max';

/** Text first in DOM so it stays above the mockup on mobile. */
export const featureSectionTextOrderWhenImageLeftClassName = 'order-1 lg:order-2';
export const featureSectionTextOrderWhenImageRightClassName = 'order-1';
export const featureSectionImageOrderWhenImageLeftClassName = 'order-2 lg:order-1';
export const featureSectionImageOrderWhenImageRightClassName = 'order-2';

export type FeatureSectionCtaVariant = 'blue' | 'yellow';

export const featureSectionCtaClassNames: Record<
  FeatureSectionCtaVariant,
  string
> = {
  blue: featureSectionCtaBlueClassName,
  yellow: featureSectionCtaYellowClassName,
};
