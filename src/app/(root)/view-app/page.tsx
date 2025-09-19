'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from '@/lib/utils';
import Video from '@/components/Video';
import {
  AccessCodeObject,
  AccessRequestObject,
  LocalStorageKey,
} from '@/types';
import { usePermissions } from '@/lib/hooks/Permissions.provider';
import VideoContainer from '@/components/VideoContainer';
import { videoList } from '@/lib/videoList';

const VERIFY_ACCESS_CODE_URL = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL}/verifyAccess`;
const ACCESS_KEY: LocalStorageKey = 'nubly-view-app-access-granted';

const ViewAppPage = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(videoList[0].videoSource);
  const [clickedKey, setClickedKey] = useState(0);
  const [accessCode, setAccessCode] = useState<AccessCodeObject | null>(null);
  const { permissions, setPermissions } = usePermissions();

  // useEffect(() => {
  //   const accessCode = getLocalStorageWithExpiry('accessCode');
  //   const viewAppAccessGranted = getLocalStorageWithExpiry(ACCESS_KEY);

  //   if (!accessCode && !viewAppAccessGranted) {
  //     router.replace('/view-app/access');
  //     return;
  //   } else {
  //     setAccessCode(accessCode);
  //   }

  //   const asyncWrapper = async () => {
  //     const accessRequestObject: AccessRequestObject = {
  //       accessCode: accessCode,
  //       resource: 'view-app',
  //     };

  //     try {
  //       const response = await fetch(VERIFY_ACCESS_CODE_URL, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(accessRequestObject),
  //       });

  //       const data = await response.json();

  //       if (response.ok) {
  //         if (data.hasPermission) {
  //           // On success, save the access grant to browser storage
  //           setLocalStorageWithExpiry(ACCESS_KEY, 'true');

  //           // setLocalStorageData('permissions', JSON.stringify(data.permisions));
  //           setLocalStorageWithExpiry(
  //             'permissions',
  //             JSON.stringify(data.permisions),
  //           );
  //           setPermissions(data.permisions);
  //         }
  //       } else {
  //         router.replace('/view-app/access');
  //       }
  //     } catch (e) {
  //       console.error('Failed to call verification function:', e);
  //       router.replace('/view-app/access');
  //     }
  //   };

  //   asyncWrapper();
  // }, []);

  useEffect(() => {
    const accessGranted = getLocalStorageWithExpiry(ACCESS_KEY);
    const accessCode = getLocalStorageWithExpiry('accessCode');

    if (accessGranted === 'true') {
      setIsAuthorized(true);
      setAccessCode(accessCode);
    } else {
      // If no access token, redirect to the access page
      router.replace('/view-app/access');
    }
  }, []);

  // While checking for authorization, we can show a loader
  // to prevent a flash of unauthorized content.
  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Verifying access...</p>
      </main>
    );
  }

  // If authorized, show the protected content
  return (
    <main className="flex flex-col items-center justify-center py-10">
      <Video
        videoSrc={'/assets/videos/hello_world.mp4'}
        className="w-full md:w-1/2 pt-10"
      />
      <div className="flex flex-col text-lg text-nubly-blue text-center py-10 px-5">
        <h1 className="text-4xl font-bold">
          Thanks for checking out Nubly {accessCode?.firstName}!
        </h1>
      </div>
      <div className="w-full flex flex-col">
        <VideoContainer videoList={videoList} />
      </div>
    </main>
  );
};

export default ViewAppPage;
