import React from 'react';
import Image from 'next/image';
import { useScrollRouter } from '@/lib/hooks/useScrollRouter';
import { SectionId } from '@/types';

const End = () => {
  const sectionId: SectionId = 'end';
  const sectionRef = useScrollRouter(sectionId);

  return (
    <section
      id={sectionId}
      ref={sectionRef.ref}
      className="w-full px-6 md:px-10 md:pt-10 border-b-nubly-yellow border-b-1">
      <div>
        <h1 className="text-4xl md:text-5xl text-center font-extrabold text-nubly-blue pt-9 px-4 md:px-9">
          One place for every money goal.
        </h1>
        <h3 className="mx-auto max-w-3xl text-xl pt-5 px-4 pb-3 text-center sm:text-2xl md:px-10 text-pretty">
          See your savings, investments, goals, and upcoming transfers in one
          simple view. Nubly helps your income move toward&nbsp;progress before
          life&nbsp;absorbs&nbsp;it.
        </h3>
      </div>
      <div className="flex justify-center pt-4 md:pt-6">
        <Image
          src="/assets/app_screen_home.png"
          alt="App screen home"
          width={350}
          height={350}
        />
      </div>
    </section>
  );
};

export default End;
