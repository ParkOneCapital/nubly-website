'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const SubmitPage = () => {
  const router = useRouter();

  return (
    <div className="w-full text-center">
      <div className="md:px-70 md:py-10">
        <div className="text-5xl text-nubly-blue font-bold px-10 py-10 md:mx-10 md:my-10">
          <h1>You&apos;re in the waitlist!</h1>
        </div>
        <div className="text-2xl px-10 py-5 md:mx-10 md:my-10">
          <h2>
            Follow us on Tik Tok and Instagram for the latest financial tips.
          </h2>

          <h2>You&apos;re well on your way to Living Nubly!</h2>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <Link
            href="https://www.instagram.com/livenubly/"
            target="_blank"
            rel="noopener noreferrer">
            <Image
              src="/assets/logos/instagram.png"
              alt="Instagram"
              width={100}
              height={100}
              className="pb-5"
            />
          </Link>
          <Link
            href="https://www.tiktok.com/@livenubly"
            target="_blank"
            rel="noopener noreferrer">
            <Image
              src="/assets/logos/tik_tok.png"
              alt="Tik Tok"
              width={100}
              height={100}
              className="pb-5"
            />
          </Link>
        </div>

        <div className="w-full flex justify-center pt-15">
          <Button
            type="button"
            className="bg-nubly-yellow text-black hover:bg-nubly-yellow/40 active:bg-nubly-yellow"
            onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;
