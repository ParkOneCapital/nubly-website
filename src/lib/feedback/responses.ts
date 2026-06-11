import {
  ACTIVE_SURVEY,
  CURRENT_SURVEY_VERSION,
  QuestionId,
  SURVEY_DEFINITIONS,
  SurveyVersion,
} from './surveyDefinitions';
import { FeedbackResponseItem, FeedbackResponses } from '@/types';

export function createEmptyAnswers(): Record<QuestionId, string> {
  const answers: Record<string, string> = {};
  for (const question of ACTIVE_SURVEY.questions) {
    answers[question.id] = '';
  }
  return answers as Record<QuestionId, string>;
}

export function formAnswersToResponses(
  answers: Record<QuestionId, string>,
  version: SurveyVersion = CURRENT_SURVEY_VERSION,
): FeedbackResponses {
  const definition = SURVEY_DEFINITIONS[version];
  if (!definition) {
    throw new Error(`Unsupported survey version: ${version}`);
  }

  const responses: FeedbackResponses = {};
  for (const question of definition.questions) {
    responses[question.id] = {
      type: question.type,
      value: answers[question.id] ?? '',
    };
  }
  return responses;
}

export function responsesToFormAnswers(
  responses: FeedbackResponses,
): Record<QuestionId, string> {
  const answers = createEmptyAnswers();
  for (const question of ACTIVE_SURVEY.questions) {
    const response = responses[question.id];
    if (response) {
      answers[question.id] = response.value;
    }
  }
  return answers;
}

export function getResponseValue(
  responses: FeedbackResponses,
  questionId: QuestionId,
): string {
  return responses[questionId]?.value ?? '';
}

export function isFeedbackResponseItem(value: unknown): value is FeedbackResponseItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const item = value as { type?: unknown; value?: unknown };
  return (
    (item.type === 'single_select' || item.type === 'text') &&
    typeof item.value === 'string'
  );
}
