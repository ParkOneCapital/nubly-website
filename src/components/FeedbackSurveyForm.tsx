'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ACTIVE_SURVEY,
  EMAIL_FIELD,
  QuestionId,
} from '@/lib/feedback/surveyDefinitions';
import {
  FeedbackFormInput,
  FeedbackFormValues,
  feedbackFormSchema,
} from '@/lib/feedback/schema';
import { cn } from '@/lib/utils';

type FeedbackSurveyFormProps = {
  initialValues: FeedbackFormInput;
  isSubmitting: boolean;
  isLoadingInitial: boolean;
  submitError: string;
  submitSuccess: boolean;
  onSubmit: (values: FeedbackFormValues) => Promise<void>;
  onCancel?: () => void;
  onSuccessDismiss?: () => void;
};

type FormErrors = {
  email?: string;
  answers?: Partial<Record<QuestionId, string>>;
};

export default function FeedbackSurveyForm({
  initialValues,
  isSubmitting,
  isLoadingInitial,
  submitError,
  submitSuccess,
  onSubmit,
  onCancel,
  onSuccessDismiss,
}: FeedbackSurveyFormProps) {
  const router = useRouter();
  const [formValues, setFormValues] =
    useState<FeedbackFormInput>(initialValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const result = feedbackFormSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors: FormErrors = { answers: {} };
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') {
          fieldErrors.email = issue.message;
          return;
        }
        if (issue.path[0] === 'answers' && typeof issue.path[1] === 'string') {
          fieldErrors.answers = {
            ...fieldErrors.answers,
            [issue.path[1] as QuestionId]: issue.message,
          };
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  const setAnswer = (questionId: QuestionId, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
  };

  const questionLabelClassName =
    'text-lg font-medium leading-relaxed md:text-base md:leading-snug lg:text-lg';

  return (
    <form onSubmit={handleSubmit} className="space-y-12 md:space-y-10">
      <div className="space-y-4 md:space-y-3">
        <label htmlFor="feedback-email" className={questionLabelClassName}>
          {EMAIL_FIELD.label}
        </label>
        <Input
          id="feedback-email"
          type="email"
          placeholder={EMAIL_FIELD.placeholder}
          className="text-base md:text-sm"
          value={formValues.email}
          onChange={(e) =>
            setFormValues((prev) => ({ ...prev, email: e.target.value }))
          }
          disabled={isSubmitting || isLoadingInitial}
          required
        />
        {formErrors.email && (
          <p className="text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      {ACTIVE_SURVEY.questions.map((question) => {
        if (question.type === 'single_select') {
          return (
            <div key={question.id} className="space-y-4 md:space-y-3">
              <p className={questionLabelClassName}>{question.label}</p>
              <div
                role="radiogroup"
                aria-label={question.label}
                className="grid gap-3 md:grid-cols-3">
                {question.options.map((option) => {
                  const isSelected =
                    formValues.answers[question.id] === option.value;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      disabled={isSubmitting || isLoadingInitial}
                      aria-pressed={isSelected}
                      className={cn(
                        isSelected &&
                          'border-nubly-blue bg-nubly-blue/80 text-white hover:bg-nubly-blue hover:text-white active:bg-nubly-blue/40',
                      )}
                      onClick={() => setAnswer(question.id, option.value)}>
                      {option.label}
                    </Button>
                  );
                })}
              </div>
              {formErrors.answers?.[question.id] && (
                <p className="text-sm text-red-600">
                  {formErrors.answers[question.id]}
                </p>
              )}
            </div>
          );
        }

        return (
          <div key={question.id} className="space-y-4 md:space-y-3">
            <label
              htmlFor={`feedback-${question.id}`}
              className={questionLabelClassName}>
              {question.label}
            </label>
            <Textarea
              id={`feedback-${question.id}`}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              className="text-base md:text-sm"
              value={formValues.answers[question.id] ?? ''}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              disabled={isSubmitting || isLoadingInitial}
              rows={5}
            />
            {formErrors.answers?.[question.id] && (
              <p className="text-sm text-red-600">
                {formErrors.answers[question.id]}
              </p>
            )}
          </div>
        );
      })}

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Dialog open={submitSuccess}>
        <DialogContent
          className="sm:max-w-sm"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Thank you for your input!</DialogTitle>
            <DialogDescription>
              Feedback saved successfully. Be sure to follow us on Instagram and
              TikTok to stay updated on our latest features and updates!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-3">
            <Link
              id="feedback-success-instagram"
              href="https://www.instagram.com/livenubly/"
              target="_blank"
              rel="noopener noreferrer">
              <Image
                src="/assets/logos/instagram.png"
                alt="Instagram"
                width={100}
                height={100}
                className="h-8 w-8"
              />
            </Link>
            <Link
              id="feedback-success-tik-tok"
              href="https://www.tiktok.com/@livenubly"
              target="_blank"
              rel="noopener noreferrer">
              <Image
                src="/assets/logos/tik_tok.png"
                alt="TikTok"
                width={100}
                height={100}
                className="h-8 w-8"
              />
            </Link>
          </div>
          <DialogFooter className="flex-col sm:flex-col">
            <Button
              type="button"
              className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40"
              onClick={() =>
                onSuccessDismiss ? onSuccessDismiss() : router.push('/')
              }>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2 pt-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => (onCancel ? onCancel() : router.push('/'))}
          disabled={isSubmitting || isLoadingInitial}
          className="w-full md:w-1/2 md:flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoadingInitial}
          className="w-full bg-nubly-blue/80 text-white hover:bg-nubly-blue active:bg-nubly-blue/40 md:w-1/2 md:flex-1">
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </div>
    </form>
  );
}
