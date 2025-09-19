'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
});

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

const SAVE_SIGNUP_URL = `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL}/saveSignUp`;

const SignUp = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const result = signUpSchema.safeParse({ firstName, lastName, email });

    if (!result.success) {
      // Extract field-specific errors from Zod validation
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof FormErrors;
        if (field) {
          fieldErrors[field] = error.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(SAVE_SIGNUP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: result.data.firstName.toLowerCase(),
          lastName: result.data.lastName.toLowerCase(),
          email: result.data.email,
        }),
      });

      console.log('response', response);

      if (response.status === 200) {
        window.alert('Successfully signed up');
        router.push('/');
      } else if (response.status === 409) {
        window.alert('A signup with this email already exists.');
      } else {
        window.alert('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      // Handle API errors here
      console.error('Signup failed:', error);
      window.alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="md:w-3/4">
      <CardHeader>
        <CardTitle>Join Waitlist</CardTitle>
        <CardDescription>
          Sign up to get notified when Nubly is ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Input
                id="first-name"
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Input
                id="last-name"
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Input
                id="email"
                type="email"
                placeholder="courtney@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          disabled={isSubmitting}
          className="w-1/2"
          // className="w-1/2 bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-1/2 bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40">
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
            </>
          ) : (
            'Sign up'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignUp;
