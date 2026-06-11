'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FeedbackSurveyForm from '@/components/FeedbackSurveyForm';
import { AccessCodeObject, FeedbackDocument, LocalStorageKey } from '@/types';
import { getLocalStorageWithExpiry } from '@/lib/utils';
import { FeedbackFormInput, FeedbackFormValues } from '@/lib/feedback/schema';
import {
  createEmptyAnswers,
  formAnswersToResponses,
  responsesToFormAnswers,
} from '@/lib/feedback/responses';
import { CURRENT_SURVEY_VERSION } from '@/lib/feedback/surveyDefinitions';
import {
  FirebaseFunctionRequestError,
  postFirebaseFunction,
} from '@/lib/firebaseFunctions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const ACCESS_KEY: LocalStorageKey = 'nubly-feedback-access-granted';

const EMPTY_FORM_VALUES: FeedbackFormInput = {
  email: '',
  answers: createEmptyAnswers(),
};

type GetFeedbackResponse = {
  exists: boolean;
  feedback: FeedbackDocument | null;
};

export default function FeedbackPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [accessCodeData, setAccessCodeData] = useState<AccessCodeObject | null>(
    null,
  );
  const [initialValues, setInitialValues] =
    useState<FeedbackFormInput>(EMPTY_FORM_VALUES);

  useEffect(() => {
    const accessGranted = getLocalStorageWithExpiry(ACCESS_KEY);
    const storedAccessCode = getLocalStorageWithExpiry('accessCode');

    if (
      accessGranted === 'true' &&
      storedAccessCode &&
      typeof storedAccessCode === 'object' &&
      'accessCode' in storedAccessCode
    ) {
      setIsAuthorized(true);
      setAccessCodeData(storedAccessCode as AccessCodeObject);
      return;
    }

    router.replace('/feedback/access');
  }, [router]);

  useEffect(() => {
    const loadFeedback = async () => {
      if (!accessCodeData?.accessCode) {
        return;
      }

      setIsLoadingInitial(true);
      try {
        const { response, data } = await postFirebaseFunction<GetFeedbackResponse>(
          'getFeedback',
          { accessCode: accessCodeData.accessCode },
        );

        if (response.ok && data.exists && data.feedback) {
          setInitialValues({
            email: data.feedback.email || accessCodeData.email || '',
            answers: responsesToFormAnswers(data.feedback.responses),
          });
          return;
        }

        setInitialValues({
          email: accessCodeData.email || '',
          answers: createEmptyAnswers(),
        });
      } catch (error) {
        const message =
          error instanceof FirebaseFunctionRequestError
            ? error.message
            : 'We could not load your existing feedback.';
        setSubmitError(message);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    if (isAuthorized) {
      void loadFeedback();
    }
  }, [accessCodeData, isAuthorized]);

  const handleSubmit = async (values: FeedbackFormValues) => {
    if (!accessCodeData?.accessCode) {
      setSubmitError('Unable to submit feedback without an access code.');
      return;
    }

    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const { response, data } = await postFirebaseFunction<{ error?: string }>(
        'saveFeedback',
        {
          accessCode: accessCodeData.accessCode,
          email: values.email,
          surveyVersion: CURRENT_SURVEY_VERSION,
          responses: formAnswersToResponses(values.answers),
        },
      );

      if (!response.ok) {
        setSubmitError(data.error || 'Could not submit feedback.');
        return;
      }

      setSubmitSuccess(true);
      setInitialValues(values);
    } catch (error) {
      const message =
        error instanceof FirebaseFunctionRequestError
          ? error.message
          : 'An unexpected error occurred. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Verifying access...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2 px-4 pb-4 pt-6 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Share Your Feedback</CardTitle>
          <CardDescription className="text-base sm:text-sm">
            Hi {accessCodeData?.firstName || 'there'}, help us improve Nubly.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          <FeedbackSurveyForm
            initialValues={initialValues}
            isLoadingInitial={isLoadingInitial}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </main>
  );
}
