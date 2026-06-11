import { describe, expect, it } from 'vitest';
import { validateSaveFeedbackPayload } from './validateSaveFeedback';

describe('validateSaveFeedbackPayload', () => {
  it('accepts and normalizes a valid versioned payload', () => {
    const result = validateSaveFeedbackPayload({
      accessCode: ' code-1 ',
      email: ' Person@Example.com ',
      surveyVersion: '1',
      responses: {
        q1: { type: 'single_select', value: 'b' },
        q2: { type: 'text', value: '  Useful app. ' },
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessCode).toBe('code-1');
      expect(result.data.email).toBe('person@example.com');
      expect(result.data.surveyVersion).toBe('1');
      expect(result.data.responses.q2.value).toBe('Useful app.');
    }
  });

  it('rejects invalid email', () => {
    const result = validateSaveFeedbackPayload({
      accessCode: 'code-1',
      email: 'bad-email',
      surveyVersion: '1',
      responses: {
        q1: { type: 'single_select', value: 'a' },
        q2: { type: 'text', value: '' },
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched question type', () => {
    const result = validateSaveFeedbackPayload({
      accessCode: 'code-1',
      email: 'person@example.com',
      surveyVersion: '1',
      responses: {
        q1: { type: 'text', value: 'a' },
        q2: { type: 'text', value: '' },
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects overly long text answers', () => {
    const result = validateSaveFeedbackPayload({
      accessCode: 'code-1',
      email: 'person@example.com',
      surveyVersion: '1',
      responses: {
        q1: { type: 'single_select', value: 'c' },
        q2: { type: 'text', value: 'x'.repeat(2001) },
      },
    });

    expect(result.success).toBe(false);
  });
});
