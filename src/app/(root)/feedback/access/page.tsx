'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessRequestObject, VerifyAccessResponse } from '@/types';
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePermissions } from '@/lib/hooks/Permissions.provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { z } from 'zod';
import {
  FirebaseFunctionRequestError,
  isFirebaseFunctionsConfigured,
  postFirebaseFunction,
} from '@/lib/firebaseFunctions';

const ACCESS_KEY = 'nubly-feedback-access-granted' as const;

const accessCodeSchema = z.object({
  accessCode: z.string().min(1, 'Access code is required'),
});

type FormErrors = {
  accessCode?: string;
};

export default function FeedbackAccessPage() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPermissions } = usePermissions();

  useEffect(() => {
    if (
      getLocalStorageWithExpiry(ACCESS_KEY) === 'true' &&
      getLocalStorageWithExpiry('permissions')
    ) {
      router.push('/feedback');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = accessCodeSchema.safeParse({ accessCode });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((validationError) => {
        const field = validationError.path[0] as keyof FormErrors;
        if (field) {
          fieldErrors[field] = validationError.message;
        }
      });
      setFormErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    if (!isFirebaseFunctionsConfigured()) {
      setError('Server configuration error. Please contact support.');
      setIsLoading(false);
      return;
    }

    const trimmedAccessCode = accessCode.trim();
    const accessRequestObject: AccessRequestObject = {
      accessCode: trimmedAccessCode,
      resource: 'feedback',
    };

    try {
      const { response, data } = await postFirebaseFunction<VerifyAccessResponse>(
        'verifyAccess',
        accessRequestObject,
      );

      if (response.ok && data.hasPermission && data.accessCode && data.permisions) {
        setLocalStorageWithExpiry(ACCESS_KEY, 'true');
        setLocalStorageWithExpiry('accessCode', data.accessCode);
        setLocalStorageWithExpiry('permissions', data.permisions);
        setPermissions(data.permisions);
        router.push('/feedback');
        return;
      }

      const deniedMessage =
        data.error ||
        (response.status === 404
          ? 'Invalid access code.'
          : 'Access denied. Please contact support.');

      setError(deniedMessage);
      setFormErrors({ accessCode: deniedMessage });
    } catch (requestError) {
      const message =
        requestError instanceof FirebaseFunctionRequestError
          ? requestError.message
          : 'An unexpected error occurred. Please try again.';
      setError(message);
      setFormErrors({ accessCode: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Nubly Feedback</CardTitle>
          <CardDescription>
            Please enter your access code to complete the feedback survey.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-2">
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
            {error && !formErrors.accessCode && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-2 py-5 md:flex-row">
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
              className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40 md:w-1/2 md:flex-1">
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
