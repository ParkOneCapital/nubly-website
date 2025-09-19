import React from 'react';
import FaqsAccordian from '@/components/FaqsAccordian';

const Faqs = () => {
  return (
    <section className="w-full md:pt-10 pl-10 pr-10 mb-10">
      <div>
        <h1 className="text-3xl md:text-3xl text-center font-bold pt-9 p-9">
          FAQs
        </h1>
      </div>
      <div className="md:ml-50 md:mr-50">
        <FaqsAccordian />
      </div>
      <div className="text-sm/4 text-gray-700 font-light text-center md:ml-40 md:mr-40 mt-10">
        <h6>
          All investing involves risk, including the possible loss of money you
          invest, and past performance does not guarantee future performance.
          Historical returns, expected returns, and probability projections are
          provided for informational and illustrative purposes, and may not
          reflect actual future performance. Nothing in this communication
          should be construed as an offer, recommendation, or solicitation to
          buy or sell any security. Additionally, the Company or its affiliates
          do not provide tax advice and investors are encouraged to consult with
          their personal tax advisors. Please see our Full Disclosure for
          important details.
        </h6>
        <br></br>
        <h6>
          By using this website, you understand the information being presented
          is provided for informational purposes only and agree to our Terms of
          Use and Privacy Policy.
        </h6>
      </div>
    </section>
  );
};

export default Faqs;
