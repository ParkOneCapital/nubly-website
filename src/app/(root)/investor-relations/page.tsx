'use client';

import React, { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';

const InvestorRelations = () => {
  // const router = useRouter();

  // useEffect(() => {
  //   router.replace('/');
  // }, [router]);

  // return null;

  redirect('/investor-relations/pitch-deck');
};

export default InvestorRelations;
