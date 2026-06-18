'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import FeedbackSurveyForm from '@/components/FeedbackSurveyForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { AccessCodeObject, FeedbackDocument, VerifyAccessResponse } from '@/types';

const EMPTY_FORM_VALUES: FeedbackFormInput = {
  email: '',
  answers: createEmptyAnswers(),
};

type GetFeedbackResponse = {
  exists: boolean;
  feedback: FeedbackDocument | null;
};

type ConferenceFeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessCode: string;
  displayName?: string;
};

export default function ConferenceFeedbackDialog({
  open,
  onOpenChange,
  accessCode,
  displayName,
}: ConferenceFeedbackDialogProps) {
  const [accessCodeData, setAccessCodeData] = useState<AccessCodeObject | null>(
    null,
  );
  const [accessError, setAccessError] = useState('');
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialValues, setInitialValues] =
    useState<FeedbackFormInput>(EMPTY_FORM_VALUES);

  useEffect(() => {
    if (!open) {
      setAccessCodeData(null);
      setAccessError('');
      setSubmitError('');
      setSubmitSuccess(false);
      setInitialValues(EMPTY_FORM_VALUES);
      return;
    }

    const loadFeedback = async () => {
      setIsLoadingInitial(true);
      setAccessError('');
      setSubmitError('');
      setSubmitSuccess(false);

      try {
        const { response, data } =
          await postFirebaseFunction<VerifyAccessResponse>('verifyAccess', {
            accessCode: accessCode.trim(),
            resource: 'feedback',
          });

        if (!response.ok || data.hasPermission !== true || !data.accessCode) {
          setAccessError(
            data.error || 'This access code does not include feedback access.',
          );
          return;
        }

        setAccessCodeData(data.accessCode);

        const feedbackResponse =
          await postFirebaseFunction<GetFeedbackResponse>('getFeedback', {
            accessCode: data.accessCode.accessCode,
          });

        if (
          feedbackResponse.response.ok &&
          feedbackResponse.data.exists &&
          feedbackResponse.data.feedback
        ) {
          setInitialValues({
            email:
              feedbackResponse.data.feedback.email ||
              data.accessCode.email ||
              '',
            answers: responsesToFormAnswers(
              feedbackResponse.data.feedback.responses,
            ),
          });
          return;
        }

        setInitialValues({
          email: data.accessCode.email || '',
          answers: createEmptyAnswers(),
        });
      } catch (error) {
        const message =
          error instanceof FirebaseFunctionRequestError
            ? error.message
            : 'We could not load the feedback form.';
        setAccessError(message);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    void loadFeedback();
  }, [open, accessCode]);

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

  const closeDialog = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Hi{' '}
            {accessCodeData?.firstName || displayName?.split(' ')[0] || 'there'}
            , help us improve Nubly without leaving the conference.
          </DialogDescription>
        </DialogHeader>

        {accessError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {accessError}
          </p>
        ) : isLoadingInitial && !accessCodeData ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading feedback form...
          </div>
        ) : accessCodeData ? (
          <FeedbackSurveyForm
            initialValues={initialValues}
            isLoadingInitial={isLoadingInitial}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            onSuccessDismiss={closeDialog}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
