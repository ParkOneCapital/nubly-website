'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AboutUs = () => {
  const router = useRouter();

  return (
    <section className="w-full text-center">
      <div className="md:px-70 md:py-10">
        <h1 className="text-5xl text-nubly-blue font-bold px-10 py-10 md:mx-10 md:my-10">
          We&apos;re making finance simple & goal based for everyone
        </h1>
        <h6 className="text-2xl px-10 py-5 md:mx-10 md:my-10">
          Nubly is a financial technology company that empowers people to take
          control of their financial life by setting goals and working towards
          them.
        </h6>
      </div>
      <div className="bg-nubly-blue px-10 py-15 md:px-70 md:py-15">
        <h1 className="text-5xl text-nubly-yellow font-bold md:mx-10 md:my-10">
          Our Mission
        </h1>
        <h6 className="text-2xl text-white md:mx-10 md:my-10">
          Finances should be simple and should not get in the way of the
          lifestyle you want. We started Nubly to take care of the hard parts so
          you can live more.
        </h6>
      </div>
      <div className="px-10 py-15 md:px-70 md:pb-30">
        <h1 className="text-5xl font-bold pb-10 md:mx-20 md:my-20 md:pb-0">
          Leadership Team
        </h1>
        <div className="flex flex-col md:flex-row justify-center gap-15 md:gap-40">
          <div className="flex flex-col items-center">
            <Image
              src="/assets/images/headshot_1.png"
              alt="Michael Ballard"
              width={200}
              height={200}
              className="pb-5"
            />
            <h1 className="text-2xl font-bold">Michael Ballard</h1>
            <h6 className="text-lg">Co-Founder & CEO</h6>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/assets/images/headshot_2.png"
              alt="Lawrence Hon"
              width={200}
              height={200}
              className="pb-5"
            />
            <h1 className="text-2xl font-bold">Lawrence Hon</h1>
            <h6 className="text-lg">Co-Founder & CTO</h6>
          </div>
        </div>
      </div>
      <div className="md:px-70 pb-15 md:pb-30">
        <button
          className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl mt-8 hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
          onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </section>
  );
};

export default AboutUs;
