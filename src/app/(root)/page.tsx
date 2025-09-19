'use client';

import Hero from '@/sections/Hero';
import Footer from '@/sections/Footer';
import Faqs from '@/sections/Faqs';
import Savings from '@/sections/Savings';
import Investing from '@/sections/Investing';
import Chat from '@/sections/Chat';
import Notifications from '@/sections/Notifications';
import End from '@/sections/End';

const Home = () => {
  return (
    <div>
      <div>
        <Hero />
      </div>
      <div>
        <Savings />
      </div>
      <div>
        <Investing />
      </div>
      <div>
        <Chat />
      </div>
      <div>
        <Notifications />
      </div>
      <div>
        <End />
      </div>
      <div>
        <Faqs />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
