export type QuestionType = 'single_select' | 'text';

export type QuestionId = `q${number}`;

export type SingleSelectQuestion = {
  id: QuestionId;
  type: 'single_select';
  label: string;
  options: readonly { value: string; label: string }[];
};

export type TextQuestion = {
  id: QuestionId;
  type: 'text';
  label: string;
  placeholder: string;
  maxLength: number;
};

export type SurveyQuestion = SingleSelectQuestion | TextQuestion;

export type SurveyDefinitionInput = {
  version: string;
  questions: readonly SurveyQuestion[];
};
