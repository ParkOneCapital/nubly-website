import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <section id="footer" className="w-full flex flex-col justify-center py-3">
      <div className="bg-base-grey flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-5 px-3 md:px-15">
        <div className="flex shrink-0 items-center pl-2">
          <Image
            src="/assets/logos/blue_nubly.png"
            alt="Nubly"
            width={100}
            height={100}
          />
        </div>

        <nav className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:w-auto sm:justify-end md:pr-10">
          <Button
            id="view-nubly-research"
            variant="link"
            className="h-auto px-2 py-1 text-xs whitespace-normal md:px-4 md:text-base md:font-semibold"
            onClick={() => router.push('/nubly-research')}>
            Nubly Research
          </Button>
          <Button
            id="view-app-button"
            variant="link"
            className="h-auto px-2 py-1 text-xs whitespace-normal md:px-4 md:text-base md:font-semibold"
            onClick={() => router.push('/view-app')}>
            View App
          </Button>
          <Button
            id="feedback-button"
            variant="link"
            className="h-auto px-2 py-1 text-xs whitespace-normal md:px-4 md:text-base md:font-semibold"
            onClick={() => router.push('/feedback')}>
            Feedback
          </Button>
          <Button
            id="about-us-button"
            variant="link"
            className="h-auto px-2 py-1 text-xs whitespace-normal md:px-4 md:text-base md:font-semibold"
            onClick={() => router.push('/about-us')}>
            About Us
          </Button>
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-3 py-5 md:pr-20">
        <div className="min-w-0 text-sm/4 font-light text-gray-700 md:pl-10">
          <p>Copyright © {currentYear} Nubly. All rights reserved.</p>
        </div>
        <div className="flex shrink-0 gap-2 pr-5">
          <Link
            id="footer-instagram"
            href="https://www.instagram.com/livenubly/"
            target="_blank"
            rel="noopener noreferrer">
            <Image
              src="/assets/logos/instagram.png"
              alt="Social Links"
              width={100}
              height={100}
              className="w-9 h-9 md:w-6 md:h-6"
            />
          </Link>
          <Link
            id="footer-tik-tok"
            href="https://www.tiktok.com/@livenubly"
            target="_blank"
            rel="noopener noreferrer">
            <Image
              src="/assets/logos/tik_tok.png"
              alt="Social Links"
              width={100}
              height={100}
              className="w-9 h-9 md:w-6 md:h-6"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Footer;
