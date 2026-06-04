'use client';

import React from 'react';
import PhoneMockupOverlay from '@/components/PhoneMockupOverlay';
import { investingMockup } from '@/lib/mockupOverlays/configs';

const InvestingGoalCardsContainer = () => {
  return <PhoneMockupOverlay {...investingMockup} />;
};

export default InvestingGoalCardsContainer;
