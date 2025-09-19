'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();
  return (
    <section className="w-full px-2 mb-30 md:my-20">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-8">
        <div className="md:w-1/2 text-left mb-8 md:mb-0 md:ml-10">
          <div className="max-w-md text-left items-start">
            <Image
              src="/assets/logos/blue_nubly.png"
              alt="Nubly"
              width={100}
              height={100}
            />
            <h1 className="text-5xl md:text-7xl text-left font-extrabold text-nubly-blue mt-4 font">
              Let&apos;s Live <br />
              Goal to Goal Instead.
            </h1>
            <h3 className="text-2xl md:text-2xl mt-5 text-left">
              Meet Nubly, together we can save & invest no matter where you are
              on your life journey. Making progress is now simple.
            </h3>
            <button
              className="bg-nubly-yellow text-black font-bold text-xl px-5 py-3 rounded-4xl w-max mt-8 hover:bg-nubly-yellow/80 active:bg-nubly-yellow/60"
              onClick={() => router.push('/join-waitlist')}>
              Join waitlist
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-auto mt-[3%] md:mt-[-10%] relative">
          <div className="w-[65%] h-full">
            <Image
              src="/assets/home_down_payment.png"
              alt="Down payment on a home"
              width={350}
              height={350}
            />
          </div>
          <div className="absolute bottom-[-75%] right-[1%] w-[65%] h-full">
            <Image
              src="/assets/trip_to_bahamas.png"
              alt="A trip to the Bahamas"
              width={350}
              height={350}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
