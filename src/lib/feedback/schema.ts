import { z } from 'zod';
import {
  ACTIVE_SURVEY,
  CURRENT_SURVEY_VERSION,
  QuestionId,
} from './surveyDefinitions';
import { FeedbackResponses } from '@/types';

function buildAnswersSchema() {
  const shape: Record<string, z.ZodType<string>> = {};

  for (const question of ACTIVE_SURVEY.questions) {
    if (question.type === 'single_select') {
      const allowedValues = question.options.map((option) => option.value) as [
        string,
        ...string[],
      ];
      shape[question.id] = z.enum(allowedValues, {
        error: 'Please select one option.',
      });
    } else {
      shape[question.id] = z
        .string()
        .max(question.maxLength, `Must be ${question.maxLength} characters or fewer.`)
        .transform((value) => value.trim());
    }
  }

  return z.object(shape);
}

function buildStoredResponsesSchema() {
  const shape: Record<string, z.ZodType<{ type: string; value: string }>> = {};

  for (const question of ACTIVE_SURVEY.questions) {
    if (question.type === 'single_select') {
      const allowedValues = question.options.map((option) => option.value) as [
        string,
        ...string[],
      ];
      shape[question.id] = z.object({
        type: z.literal('single_select'),
        value: z.enum(allowedValues),
      });
    } else {
      shape[question.id] = z.object({
        type: z.literal('text'),
        value: z
          .string()
          .max(question.maxLength, `Must be ${question.maxLength} characters or fewer.`)
          .transform((value) => value.trim()),
      });
    }
  }

  return z.object(shape);
}

const answersSchema = buildAnswersSchema();
const storedResponsesSchema = buildStoredResponsesSchema();

export const feedbackFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  answers: answersSchema,
});

export const feedbackResponsesSchema = storedResponsesSchema;

export const saveFeedbackRequestSchema = z.object({
  accessCode: z.string().min(1),
  email: z.string().email('Please enter a valid email address.'),
  surveyVersion: z.literal(CURRENT_SURVEY_VERSION),
  responses: feedbackResponsesSchema,
});

export type FeedbackAnswersInput = Record<QuestionId, string>;

export type FeedbackFormInput = {
  email: string;
  answers: FeedbackAnswersInput;
};

export type FeedbackFormValues = {
  email: string;
  answers: FeedbackAnswersInput;
};

export type StoredFeedbackResponses = FeedbackResponses;
