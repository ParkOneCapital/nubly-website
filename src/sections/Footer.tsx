import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { SectionId } from '@/types';

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <section id="footer" className="w-full flex flex-col justify-center py-3">
      <div className="bg-base-grey flex justify-between items-center py-5 px-2 md:px-15">
        <div className="w-2/12 h-2/12 flex items-center pl-2">
          <Image
            src="/assets/logos/blue_nubly.png"
            alt="Nubly"
            width={100}
            height={100}
          />
        </div>

        <div className="flex items-start justify-center md:pr-10">
          <div>
            <Button
              id="view-nubly-research"
              variant="link"
              className="text-xs md:text-base md:font-semibold"
              onClick={() => router.push('/nubly-research')}>
              Nubly Research
            </Button>
          </div>
          <div>
            <Button
              id="view-app-button"
              variant="link"
              className="text-xs md:text-base md:font-semibold"
              onClick={() => router.push('/view-app')}>
              View App
            </Button>
          </div>
          <div>
            <Button
              id="about-us-button"
              variant="link"
              className="text-xs md:text-base md:font-semibold"
              onClick={() => router.push('/about-us')}>
              About Us
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-5 md:pr-20">
        <div className="text-sm/4 text-gray-700 font-light text-center md:pl-10">
          <p>Copyright © {currentYear} Nubly. All rights reserved.</p>
        </div>
        <div className="flex pr-5 gap-2">
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
