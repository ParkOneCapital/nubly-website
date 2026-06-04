'use client';

import React from 'react';
import PhoneMockupOverlay from '@/components/PhoneMockupOverlay';
import { notificationsMockup } from '@/lib/mockupOverlays/configs';

const NotificationsCardContainer = () => {
  return <PhoneMockupOverlay {...notificationsMockup} />;
};

export default NotificationsCardContainer;
