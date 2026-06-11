import type { SurveyDefinitionInput, SurveyQuestion } from '../types';
import { surveyV1 } from './v1';
import { surveyV2 } from './v2';
import { surveyV3 } from './v3';

/**
 * Register survey versions here. To add a new version:
 * 1. Create `surveys/vN.ts` exporting `surveyVN` (copy an existing file as a template).
 * 2. Import it above and add one line below.
 * 3. Set CURRENT_SURVEY_VERSION in `surveyDefinitions.ts`.
 */
export const SURVEY_DEFINITIONS = {
  [surveyV1.version]: surveyV1,
  [surveyV2.version]: surveyV2,
  [surveyV3.version]: surveyV3,
} as const satisfies Record<string, SurveyDefinitionInput>;

export type SurveyVersion = keyof typeof SURVEY_DEFINITIONS;

export type SurveyDefinition = {
  version: SurveyVersion;
  questions: readonly SurveyQuestion[];
};
