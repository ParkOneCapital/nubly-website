import {
  CURRENT_SURVEY_VERSION,
  SURVEY_DEFINITIONS,
  SurveyVersion,
  isSurveyVersion,
} from './surveyDefinitions';

export type FeedbackResponseItem = {
  type: 'single_select' | 'text';
  value: string;
};

export type FeedbackResponsesInput = Record<string, FeedbackResponseItem>;

export type SaveFeedbackPayload = {
  accessCode: string;
  email: string;
  surveyVersion: SurveyVersion;
  responses: FeedbackResponsesInput;
};

export type ValidationResult =
  | { success: true; data: SaveFeedbackPayload }
  | { success: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isResponseItem(value: unknown): value is FeedbackResponseItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const item = value as { type?: unknown; value?: unknown };
  return (
    (item.type === 'single_select' || item.type === 'text') &&
    typeof item.value === 'string'
  );
}

function validateResponsesForVersion(
  responses: unknown,
  version: SurveyVersion,
):
  | { success: true; data: FeedbackResponsesInput }
  | { success: false; error: string } {
  if (!responses || typeof responses !== 'object') {
    return { success: false, error: 'responses is required.' };
  }

  const survey = SURVEY_DEFINITIONS[version];
  const parsedResponses = responses as Record<string, unknown>;
  const normalized: FeedbackResponsesInput = {};

  for (const question of survey.questions) {
    const response = parsedResponses[question.id];
    if (!isResponseItem(response)) {
      return {
        success: false,
        error: `responses.${question.id} must include type and value.`,
      };
    }

    if (response.type !== question.type) {
      return {
        success: false,
        error: `responses.${question.id}.type must be "${question.type}".`,
      };
    }

    if (question.type === 'single_select') {
      const allowedValues = question.options.map((option) => option.value);
      if (!allowedValues.some((value) => value === response.value)) {
        return {
          success: false,
          error: `responses.${question.id}.value is invalid.`,
        };
      }
      normalized[question.id] = {
        type: 'single_select',
        value: response.value,
      };
      continue;
    }

    const trimmedValue = response.value.trim();
    if (trimmedValue.length > question.maxLength) {
      return {
        success: false,
        error: `responses.${question.id}.value must be ${question.maxLength} characters or fewer.`,
      };
    }

    normalized[question.id] = {
      type: 'text',
      value: trimmedValue,
    };
  }

  return { success: true, data: normalized };
}

export function validateSaveFeedbackPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'Request body must be an object.' };
  }

  const parsedPayload = payload as {
    accessCode?: unknown;
    email?: unknown;
    surveyVersion?: unknown;
    responses?: unknown;
  };

  if (
    !parsedPayload.accessCode ||
    typeof parsedPayload.accessCode !== 'string' ||
    parsedPayload.accessCode.trim().length === 0
  ) {
    return { success: false, error: 'accessCode is required.' };
  }

  if (
    !parsedPayload.email ||
    typeof parsedPayload.email !== 'string' ||
    !EMAIL_REGEX.test(parsedPayload.email.trim())
  ) {
    return { success: false, error: 'A valid email is required.' };
  }

  const surveyVersion = parsedPayload.surveyVersion ?? CURRENT_SURVEY_VERSION;
  if (!isSurveyVersion(surveyVersion)) {
    const supportedVersions = Object.keys(SURVEY_DEFINITIONS).join(', ');
    return {
      success: false,
      error: `surveyVersion is not supported. Received "${String(surveyVersion)}". Supported: ${supportedVersions}. Rebuild and restart Cloud Functions after updating the survey.`,
    };
  }

  const responsesResult = validateResponsesForVersion(
    parsedPayload.responses,
    surveyVersion,
  );
  if (!responsesResult.success) {
    return responsesResult;
  }

  return {
    success: true,
    data: {
      accessCode: parsedPayload.accessCode.trim(),
      email: parsedPayload.email.trim().toLowerCase(),
      surveyVersion,
      responses: responsesResult.data,
    },
  };
}
