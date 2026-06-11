export type {
  QuestionId,
  QuestionType,
  SingleSelectQuestion,
  SurveyDefinitionInput,
  SurveyQuestion,
  TextQuestion,
} from './types';

export {
  SURVEY_DEFINITIONS,
  type SurveyDefinition,
  type SurveyVersion,
} from './surveys';

import { SURVEY_DEFINITIONS, type SurveyVersion } from './surveys';

/** Set this to the version new submissions should use. Must exist in SURVEY_DEFINITIONS. */
export const CURRENT_SURVEY_VERSION = '3' satisfies SurveyVersion;

export const ACTIVE_SURVEY = SURVEY_DEFINITIONS[CURRENT_SURVEY_VERSION];

export const EMAIL_FIELD = {
  label: 'What is your email address?',
  placeholder: 'you@example.com',
} as const;

export function isSurveyVersion(value: unknown): value is SurveyVersion {
  return typeof value === 'string' && value in SURVEY_DEFINITIONS;
}
