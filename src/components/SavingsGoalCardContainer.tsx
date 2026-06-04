'use client';

import React from 'react';
import PhoneMockupOverlay from '@/components/PhoneMockupOverlay';
import { savingsMockup } from '@/lib/mockupOverlays/configs';

const SavingsGoalCardsContainer = () => {
  return <PhoneMockupOverlay {...savingsMockup} />;
};

export default SavingsGoalCardsContainer;
