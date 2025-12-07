'use client';

import React, { Suspense } from 'react';
import SignUp from '@/components/SignUp';
import { useSearchParams } from 'next/navigation';
import { SectionId } from '@/types';

function JoinWaitlistForm() {
  const searchParams = useSearchParams();
  const source = (searchParams.get('source') as SectionId) || 'unknown';
  return <SignUp source={source} />;
}

const JoinWaitlistPage = () => {
  return (
    <div className="w-full max-w-md mx-auto flex justify-center items-center h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <JoinWaitlistForm />
      </Suspense>
    </div>
  );
};

export default JoinWaitlistPage;
