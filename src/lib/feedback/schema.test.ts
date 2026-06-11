import { describe, expect, it } from 'vitest';
import { CURRENT_SURVEY_VERSION } from './surveyDefinitions';
import { feedbackFormSchema, saveFeedbackRequestSchema } from './schema';

describe('feedbackFormSchema', () => {
  it('accepts valid values and trims text answers', () => {
    const result = feedbackFormSchema.safeParse({
      email: 'user@example.com',
      answers: {
        q1: 'b',
        q2: 'a',
        q3: '7',
        q4: '  Helpful product  ',
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.answers.q4).toBe('Helpful product');
    }
  });

  it('rejects unanswered single_select questions', () => {
    const result = feedbackFormSchema.safeParse({
      email: 'user@example.com',
      answers: {
        q1: '',
        q2: 'a',
        q3: '5',
        q4: '',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = feedbackFormSchema.safeParse({
      email: 'bad-email',
      answers: {
        q1: 'a',
        q2: 'a',
        q3: '5',
        q4: '',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects text answers above max length', () => {
    const result = feedbackFormSchema.safeParse({
      email: 'user@example.com',
      answers: {
        q1: 'c',
        q2: 'b',
        q3: '10',
        q4: 'x'.repeat(2001),
      },
    });

    expect(result.success).toBe(false);
  });
});

describe('saveFeedbackRequestSchema', () => {
  it('accepts valid versioned payload', () => {
    const result = saveFeedbackRequestSchema.safeParse({
      accessCode: 'abc123',
      email: 'user@example.com',
      surveyVersion: CURRENT_SURVEY_VERSION,
      responses: {
        q1: { type: 'single_select', value: 'a' },
        q2: { type: 'single_select', value: 'b' },
        q3: { type: 'single_select', value: '8' },
        q4: { type: 'text', value: 'Great work' },
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid single_select value', () => {
    const result = saveFeedbackRequestSchema.safeParse({
      accessCode: 'abc123',
      email: 'user@example.com',
      surveyVersion: CURRENT_SURVEY_VERSION,
      responses: {
        q1: { type: 'single_select', value: 'd' },
        q2: { type: 'single_select', value: 'b' },
        q3: { type: 'single_select', value: '8' },
        q4: { type: 'text', value: 'Great work' },
      },
    });

    expect(result.success).toBe(false);
  });
});
