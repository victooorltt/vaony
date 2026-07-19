"use client";

import { useState } from "react";
import { ChevronDownIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl border border-vaony-ink/10 bg-white transition-all duration-200 overflow-hidden shadow-xs hover:border-vaony-blue/30"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none group cursor-pointer"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-vaony-blue/10 text-vaony-blue shrink-0 group-hover:bg-vaony-blue group-hover:text-white transition-colors duration-200">
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-vaony-ink group-hover:text-vaony-blue transition-colors duration-200">
                  {item.question}
                </h3>
              </div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-vaony-paper text-vaony-ink/60 transition-transform duration-200 shrink-0 ${
                  isOpen ? "rotate-180 bg-vaony-blue/10 text-vaony-blue" : ""
                }`}
              >
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-6 pt-0 sm:px-6 text-vaony-ink/75 leading-relaxed border-t border-vaony-ink/5 mt-1 pt-4 text-base">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
