'use client';

import { useMemo, useState } from 'react';
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
  saveConferenceSession,
  type ConferenceRole,
} from '@/lib/conferenceSession';
import {
  FirebaseFunctionRequestError,
  isFirebaseFunctionsConfigured,
  postFirebaseFunction,
} from '@/lib/firebaseFunctions';
import { VerifyAccessResponse } from '@/types';

const verifyStepSchema = z.object({
  role: z.enum(['participant', 'interviewer']),
  accessCode: z.string().min(1, 'Access code is required'),
  displayName: z.string().min(1, 'Display name is required'),
});

const roomStepSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

type VerifyStep = z.infer<typeof verifyStepSchema>;

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

  const headerText = useMemo(
    () => (role === 'participant' ? 'Participant login' : 'Interviewer login'),
    [role],
  );

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setVerifyErrors({});

    const parsed = verifyStepSchema.safeParse({
      role,
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

    setIsVerifying(true);
    try {
      const resource =
        role === 'participant'
          ? 'conference-room-participant'
          : 'conference-room-interviewer';
      const { response, data } =
        await postFirebaseFunction<VerifyAccessResponse>('verifyAccess', {
          accessCode: parsed.data.accessCode,
          resource,
        });
      if (!response.ok || data.hasPermission !== true) {
        setError(data.error || 'Invalid access code.');
        return;
      }
      setIsVerified(true);
      if (role === 'participant' && !roomCode.trim()) {
        setRoomCode(parsed.data.accessCode);
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
      saveConferenceSession({
        role,
        accessCode: accessCode.trim(),
        displayName: displayName.trim(),
        roomCode: parsedRoom.data.roomCode,
      });
      router.push('/conference-room');
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
              ? role === 'participant'
                ? 'Choose the room code to share with your interviewer.'
                : 'Enter the participant room code to join the same room.'
              : 'Verify access before joining the conference room.'}
          </CardDescription>
        </CardHeader>
        {!isVerified ? (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === 'participant' ? 'default' : 'outline'}
                  onClick={() => setRole('participant')}
                  disabled={isVerifying}>
                  Participant
                </Button>
                <Button
                  type="button"
                  variant={role === 'interviewer' ? 'default' : 'outline'}
                  onClick={() => setRole('interviewer')}
                  disabled={isVerifying}>
                  Interviewer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{headerText}</p>
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
                placeholder={
                  role === 'participant'
                    ? 'Participant access code'
                    : 'Interviewer access code'
                }
                disabled={isVerifying}
                required
              />
              {verifyErrors.accessCode ? (
                <p className="text-sm text-red-600">
                  {verifyErrors.accessCode}
                </p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
                disabled={isVerifying}>
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
              <Input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder={
                  role === 'participant'
                    ? 'Create room code'
                    : 'Enter participant room code'
                }
                disabled={isEntering}
                required
              />
              {roomCodeError ? (
                <p className="text-sm text-red-600">{roomCodeError}</p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
                disabled={isEntering}>
                {isEntering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Enter Room'
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
