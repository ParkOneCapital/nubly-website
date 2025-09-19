import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import faqsData from '@/lib/faqsData';

const FaqsAccordian = () => {
  const faqs = faqsData;

  const faqsItems = faqs.map((faq, index) => (
    <AccordionItem key={index} value={faq.question}>
      <AccordionTrigger className="text-xl font-medium">
        {faq.question}
      </AccordionTrigger>
      <AccordionContent className="text-lg text-gray-600">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  ));

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1">
      {faqsItems}
    </Accordion>
  );
};

export default FaqsAccordian;
