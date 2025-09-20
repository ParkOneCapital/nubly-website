'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalStorageWithExpiry } from '@/lib/utils';
import CardContainer from '@/components/CardContainer';
import { usePermissions } from '@/lib/hooks/Permissions.provider';
import { LocalStorageKey, AccessCodeObject } from '@/types';
import { Button } from '@/components/ui/button';

const ACCESS_KEY: LocalStorageKey = 'nubly-research-access-granted';

const NublyResearchPage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState<AccessCodeObject | null>(null);
  const { permissions, setPermissions } = usePermissions();

  useEffect(() => {
    const accessGranted = getLocalStorageWithExpiry(ACCESS_KEY);
    const permissions = getLocalStorageWithExpiry('permissions');
    const accessCode = getLocalStorageWithExpiry('accessCode');

    if (accessGranted === 'true' && permissions) {
      setIsAuthorized(true);
      setPermissions(permissions);
      setAccessCode(accessCode);
    } else {
      // If no access token, redirect to the access page
      router.replace('/nubly-research/access');
    }
  }, [router]);

  // While checking for authorization, we can show a loader
  // to prevent a flash of unauthorized content.
  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Verifying access...</p>
      </main>
    );
  }

  return (
    <main className=" w-full flex flex-col items-center justify-center py-15">
      <div className="text-center md:px-70">
        <h1 className="text-4xl text-nubly-blue font-bold md:px-10 md:pb-5">
          Welcome to Nubly Research
        </h1>
        <h6 className="mt-4 text-lg text-gray-600 px-10 md:pb-5">
          Our team publishes research and analysis on our findings of the latest
          trends and innovations in the financial technology landscape. Browse
          our collection of articles, reports, and opinions to gain valuable
          insights and inform your business strategy.
        </h6>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 md:px-6 lg:px-8">
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 place-items-center">
          <CardContainer
            accessCode={accessCode?.accessCode || null}
            cardId="baas-overview"
            title="BaaS Overview"
            description="Open sourced research"
            link="https://parkonecapital.github.io/nubly-research-baas-overview/cover-page.html"
            permissions={{
              view: permissions?.['nubly-research']?.['baas-overview']?.view,
              download:
                permissions?.['nubly-research']?.['baas-overview']?.download,
            }}
          />
          <CardContainer
            accessCode={accessCode?.accessCode || null}
            cardId="baas-transformation-strategy"
            title="BaaS Transformation Strategy"
            description="Model Summary"
            link="https://parkonecapital.github.io/nubly-research-baas-transformation-strategy/cover-page.html"
            permissions={{
              view: permissions?.['nubly-research']?.[
                'baas-transformation-strategy'
              ]?.view,
              download:
                permissions?.['nubly-research']?.[
                  'baas-transformation-strategy'
                ]?.download,
            }}
          />
          <CardContainer
            accessCode={accessCode?.accessCode || null}
            cardId="modern-fintech-future"
            title="Modern Fintech Future"
            description="Open sourced research"
            link="https://parkonecapital.github.io/nubly-research-modern-fintech-future/cover-page.html"
            permissions={{
              view: permissions?.['nubly-research']?.['modern-fintech-future']
                ?.view,
              download:
                permissions?.['nubly-research']?.['modern-fintech-future']
                  ?.download,
            }}
          />
          <CardContainer
            accessCode={accessCode?.accessCode || null}
            cardId="the-modern-cdfi"
            title="The Modern CDFI"
            description="Whitepaper #1"
            link="https://parkonecapital.github.io/nubly-research-who-are-we/cover-page.html"
            permissions={{
              view: permissions?.['nubly-research']?.['the-modern-dcfi']?.view,
              download:
                permissions?.['nubly-research']?.['the-modern-dcfi']?.download,
            }}
          />
        </div>
        <div className="w-full flex justify-center pt-15">
          <Button
            type="button"
            variant="outline"
            // className="bg-nubly-yellow/60 text-black hover:bg-nubly-yellow/40 active:bg-nubly-yellow"
            onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NublyResearchPage;
