'use client';

import React from 'react';
import SignUp from '@/components/SignUp';
import { useSearchParams } from 'next/navigation';
import { SectionId } from '@/types';

const JoinWaitlistPage = () => {
  const searchParams = useSearchParams();
  const source = (searchParams.get('source') as SectionId) || 'unknown';

  return (
    <div className="w-full max-w-md mx-auto flex justify-center items-center h-screen">
      <SignUp source={source} />
    </div>
  );
};

export default JoinWaitlistPage;
