'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  clearConferenceSession,
  saveConferenceSession,
  type ConferenceRole,
} from '@/lib/conferenceSession';
import { resolveConferenceBackendUrl } from '@/lib/resolveConferenceBackendUrl';
import {
  CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE,
  isConferenceBackendAvailable,
} from '@/lib/conferenceBackendAvailability';
import {
  CONFERENCE_RESOURCE,
  isConferenceModerator,
} from '@/lib/conferencePermissions';
import {
  FirebaseFunctionRequestError,
  isFirebaseFunctionsConfigured,
  postFirebaseFunction,
} from '@/lib/firebaseFunctions';
import { VerifyAccessResponse } from '@/types';

const verifyStepSchema = z.object({
  accessCode: z.string().min(1, 'Access code is required'),
  displayName: z.string().min(1, 'Display name is required'),
});

const roomStepSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

type VerifyStep = z.infer<typeof verifyStepSchema>;

const buildSuggestedRoomCode = (): string =>
  `session-${Math.random().toString(36).slice(2, 8)}`;

export default function ConferenceRoomAccessPage() {
  const router = useRouter();
  const [role, setRole] = useState<ConferenceRole>('participant');
  const [accessCode, setAccessCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [verifyErrors, setVerifyErrors] = useState<Partial<VerifyStep>>({});
  const [roomCodeError, setRoomCodeError] = useState('');
  const [isCheckingLoginAvailability, setIsCheckingLoginAvailability] =
    useState(false);

  const backendBaseUrl = useMemo(
    () =>
      resolveConferenceBackendUrl(
        process.env.NEXT_PUBLIC_NUBLY_BACKEND_URL,
        typeof window !== 'undefined' ? window.location.hostname : undefined,
        typeof window !== 'undefined' ? window.location.protocol : undefined,
      ),
    [],
  );

  const isModerator = role === 'moderator';

  const checkLoginAvailability = async (): Promise<boolean> => {
    if (!backendBaseUrl) {
      return false;
    }

    setIsCheckingLoginAvailability(true);
    try {
      return await isConferenceBackendAvailable(backendBaseUrl);
    } finally {
      setIsCheckingLoginAvailability(false);
    }
  };

  useEffect(() => {
    clearConferenceSession();
  }, []);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setVerifyErrors({});

    const parsed = verifyStepSchema.safeParse({
      accessCode: accessCode.trim(),
      displayName: displayName.trim(),
    });
    if (!parsed.success) {
      const fieldErrors: Partial<VerifyStep> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'accessCode') {
          fieldErrors.accessCode = issue.message;
        }
        if (field === 'displayName') {
          fieldErrors.displayName = issue.message;
        }
      }
      setVerifyErrors(fieldErrors);
      return;
    }

    if (!isFirebaseFunctionsConfigured()) {
      setError('Access verification is not configured.');
      return;
    }

    const backendAvailable = await checkLoginAvailability();
    if (!backendAvailable) {
      setError(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE);
      return;
    }

    setIsVerifying(true);
    try {
      const { response, data } =
        await postFirebaseFunction<VerifyAccessResponse>('verifyAccess', {
          accessCode: parsed.data.accessCode,
          resource: CONFERENCE_RESOURCE,
        });
      if (!response.ok || data.hasPermission !== true) {
        setError(data.error || 'Invalid access code.');
        return;
      }

      const resolvedRole: ConferenceRole = isConferenceModerator(
        data.permisions,
      )
        ? 'moderator'
        : 'participant';
      setRole(resolvedRole);
      setIsVerified(true);
      if (resolvedRole === 'moderator' && !roomCode.trim()) {
        setRoomCode(buildSuggestedRoomCode());
      }
    } catch (value: unknown) {
      const error =
        value instanceof FirebaseFunctionRequestError
          ? value.message
          : 'Unable to verify access code.';
      setError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnterRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRoomCodeError('');
    setError('');

    const parsedRoom = roomStepSchema.safeParse({
      roomCode: roomCode.trim(),
    });
    if (!parsedRoom.success) {
      setRoomCodeError(
        parsedRoom.error.issues[0]?.message || 'Room code is required',
      );
      return;
    }

    setIsEntering(true);
    try {
      if (!backendBaseUrl) {
        setError(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE);
        return;
      }

      const backendAvailable = await checkLoginAvailability();
      if (!backendAvailable) {
        setError(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE);
        return;
      }

      const response = await fetch(
        `${backendBaseUrl}/api/v1/livekit/conference/room-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_code: accessCode.trim(),
            room_code: parsedRoom.data.roomCode,
            role,
          }),
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        can_enter?: boolean;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok || payload?.can_enter !== true) {
        if (!response.ok && response.status >= 500) {
          setError(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE);
          return;
        }

        setRoomCodeError(
          payload?.message ||
            payload?.error ||
            'Unable to enter this room with that code.',
        );
        return;
      }

      saveConferenceSession({
        role,
        accessCode: accessCode.trim(),
        displayName: displayName.trim(),
        roomCode: parsedRoom.data.roomCode,
      });
      router.push('/conference-room');
    } catch {
      setError(CONFERENCE_LOGIN_UNAVAILABLE_MESSAGE);
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Conference Login</CardTitle>
          <CardDescription>
            {isVerified
              ? isModerator
                ? 'Create a room code and share it with participants.'
                : 'Enter the room code your moderator shared.'
              : 'Verify access before joining the conference room.'}
          </CardDescription>
        </CardHeader>
        {!isVerified ? (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-3">
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                disabled={isVerifying}
                required
              />
              {verifyErrors.displayName ? (
                <p className="text-sm text-red-600">
                  {verifyErrors.displayName}
                </p>
              ) : null}
              <Input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="Access code"
                disabled={isVerifying}
                required
              />
              {verifyErrors.accessCode ? (
                <p className="text-sm text-red-600">
                  {verifyErrors.accessCode}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-2 py-5 md:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full md:w-1/2 md:flex-1"
                disabled={isVerifying}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40 md:w-1/2 md:flex-1"
                disabled={isVerifying || isCheckingLoginAvailability}>
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Continue'
                )}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleEnterRoom}>
            <CardContent className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium">
                  {isModerator ? 'Create room code' : 'Room code'}
                </span>
                <Input
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(event.target.value);
                    if (roomCodeError) {
                      setRoomCodeError('');
                    }
                  }}
                  placeholder={
                    isModerator
                      ? 'Choose a code to share'
                      : 'Enter the code from your moderator'
                  }
                  disabled={isEntering}
                  required
                />
              </label>
              <p className="text-xs text-muted-foreground">
                {isModerator
                  ? 'Only moderators can open a room. Share this exact code with participants.'
                  : 'Use the room code your moderator already opened.'}
              </p>
              {roomCodeError ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {roomCodeError}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center gap-2 py-5 md:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVerified(false)}
                className="w-full md:w-1/2 md:flex-1"
                disabled={isEntering}>
                Back
              </Button>
              <Button
                type="submit"
                className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40 md:w-1/2 md:flex-1"
                disabled={isEntering || isCheckingLoginAvailability}>
                {isEntering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isModerator ? (
                  'Start Room'
                ) : (
                  'Join Room'
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
