import type { SurveyDefinitionInput } from '../types';

export const surveyV1 = {
  version: '1',
  questions: [
    {
      id: 'q1',
      type: 'single_select',
      label: 'How would you rate your experience with Nubly so far?',
      options: [
        { value: 'a', label: 'A. Excellent' },
        { value: 'b', label: 'B. Good' },
        { value: 'c', label: 'C. Needs improvement' },
      ],
    },
    {
      id: 'q2',
      type: 'text',
      label: 'What else would you like us to know?',
      placeholder: 'Share any thoughts, suggestions, or concerns...',
      maxLength: 2000,
    },
  ],
} as const satisfies SurveyDefinitionInput;
