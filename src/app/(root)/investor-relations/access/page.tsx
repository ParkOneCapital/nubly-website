'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessRequestObject, LocalStorageKey } from '@/types';
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/lib/hooks/Permissions.provider';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { z } from 'zod';

const VERIFY_ACCESS_CODE_URL = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL}/verifyAccess`;
const SAVE_RESEARCH_LOGIN_ATTEMPT_URL = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL}/saveResearchLoginAttempt`;
const ACCESS_KEY: LocalStorageKey = 'investor-relations-access-granted';

const accessCodeSchema = z.object({
  accessCode: z.string().min(1, 'Access code is required'),
});

type FormErrors = {
  accessCode?: string;
};

export default function AccessPage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPermissions } = usePermissions();

  useEffect(() => {
    // Check if the user already has access
    if (
      getLocalStorageWithExpiry(ACCESS_KEY) === 'true' &&
      getLocalStorageWithExpiry('permissions')
    ) {
      router.push('/investor-relations');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = accessCodeSchema.safeParse({ accessCode });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof FormErrors;
        if (field) {
          fieldErrors[field] = error.message;
        }
      });
      setFormErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    if (!VERIFY_ACCESS_CODE_URL) {
      console.error('Verify access code URL is not configured.');
      setError('Server configuration error. Please contact support.');
      setIsLoading(false);
      return;
    }

    const accessRequestObject: AccessRequestObject = {
      accessCode: accessCode,
      resource: 'investor-relations',
    };

    try {
      const response = await fetch(VERIFY_ACCESS_CODE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessRequestObject),
      });

      const data = await response.json();

      if (response.ok) {
        await fetch(SAVE_RESEARCH_LOGIN_ATTEMPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessCode: accessCode,
            success: true,
            userAgent:
              typeof navigator !== 'undefined'
                ? navigator.userAgent
                : 'unknown',
            clientTimestamp: new Date().toISOString(),
            context: 'InvestorRelationsAuth',
          }),
        });

        if (data.hasPermission) {
          // On success, save the access grant to browser storage
          setLocalStorageWithExpiry(ACCESS_KEY, 'true');
          setLocalStorageWithExpiry('accessCode', data.accessCode);
          setLocalStorageWithExpiry('permissions', data.permisions);
          setPermissions(data.permisions);

          console.log('Access granted. Redirecting...');
          router.push('/investor-relations');
        } else if (data.hasPermission === false) {
          setError('Access denied. Please contact support.');
          setFormErrors({
            accessCode: 'Access denied. Please contact support.',
          });
          setIsLoading(false);
        }
      } else {
        await fetch(SAVE_RESEARCH_LOGIN_ATTEMPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessCode: accessCode,
            success: false,
            userAgent:
              typeof navigator !== 'undefined'
                ? navigator.userAgent
                : 'unknown',
            clientTimestamp: new Date().toISOString(),
            context: 'InvestorRelationsAuth',
          }),
        });
        setError(data.error || 'Invalid access code. Please try again.');
        setFormErrors({
          accessCode: 'Invalid access code. Please try again.',
        });
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Failed to call verification function:', e);
      setError('An unexpected error occurred. Please try again.');
      setFormErrors({
        accessCode: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Investor Relations</CardTitle>
          <CardDescription>
            Please enter your access code to view the investor relations page.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Input
              id="access-code"
              name="access-code"
              type="text"
              placeholder="Access Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={isLoading}
              required
            />
            {formErrors.accessCode && (
              <p className="text-sm text-red-600">{formErrors.accessCode}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row items-center justify-center gap-2 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}
              disabled={isLoading}
              className="w-full md:w-1/2 md:flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-1/2 md:flex-1 bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40">
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
