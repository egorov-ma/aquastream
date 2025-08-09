"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Faq = { id: string; q: string; a: string };

export function FaqList() {
  const faqs: Faq[] = [
    { id: "f1", q: "Как записаться на событие?", a: "Выберите событие и нажмите Записаться." },
    { id: "f2", q: "Как оплатить участие?", a: "Оплатите через виджет или по QR и загрузите пруф." },
  ];
  return (
    <Accordion type="single" collapsible data-test-id="org-faq">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={f.id}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}


