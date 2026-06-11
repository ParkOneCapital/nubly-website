import type { SurveyDefinitionInput } from '../types';

export const surveyV2 = {
  version: '2',
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
      type: 'single_select',
      label: 'How useful is the Nubly app for you?',
      options: [
        { value: 'a', label: 'A. Very useful' },
        { value: 'b', label: 'B. Somewhat useful' },
        { value: 'c', label: 'C. Not useful' },
      ],
    },
    {
      id: 'q3',
      type: 'text',
      label: 'What else would you like us to know?',
      placeholder: 'Share any thoughts, suggestions, or concerns...',
      maxLength: 2000,
    },
  ],
} as const satisfies SurveyDefinitionInput;
