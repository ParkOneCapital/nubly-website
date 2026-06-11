import type { SurveyDefinitionInput } from '../types';

export const surveyV3 = {
  version: '3',
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
      type: 'single_select',
      label:
        'If Nubly was taken from you, on a scale of 1 to 10, how much would you miss it?',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
      ],
    },
    {
      id: 'q4',
      type: 'text',
      label: 'What else would you like us to know?',
      placeholder: 'Share any thoughts, suggestions, or concerns...',
      maxLength: 2000,
    },
  ],
} as const satisfies SurveyDefinitionInput;
