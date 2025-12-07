'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import faqsData from '@/lib/faqsData';
import { useFaqAnalytics } from './Tracking/Google/hooks/useFaqsAnalytics';

interface FaqsAccordionProps {
  isSectionVisible: boolean;
}

const FaqsAccordion = ({ isSectionVisible }: FaqsAccordionProps) => {
  const faqs = faqsData;
  const [activeFaq, setActiveFaq] = useState<string | undefined>();

  useFaqAnalytics({
    isSectionVisible,
    activeFaqValue: activeFaq,
  });

  const faqsItems = faqs.map((faq, index) => (
    <AccordionItem key={index} value={faq.question}>
      <AccordionTrigger
        id={`accordion-item-${index}`}
        className="text-xl font-medium">
        {faq.question}
      </AccordionTrigger>
      <AccordionContent
        id={`accordion-item-${index}-answer`}
        className="text-lg text-gray-600">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  ));

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
      value={activeFaq}
      onValueChange={setActiveFaq}>
      {faqsItems}
    </Accordion>
  );
};

export default FaqsAccordion;
