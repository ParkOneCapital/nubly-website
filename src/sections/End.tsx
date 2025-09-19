import React from 'react';
import Image from 'next/image';

const End = () => {
  return (
    <section className="w-full md:pt-10 border-b-nubly-yellow border-b-1">
      <div>
        <h1 className="text-4xl md:text-5xl text-center font-extrabold text-nubly-blue pt-9 p-9">
          Saving and Investing, all in one place.
        </h1>
      </div>
      <div className="flex justify-center md:pt-5">
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
