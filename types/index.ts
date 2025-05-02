export type Form = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  questions: Question[];
  responses: Response[];
};

export type Question = {
  id: string;
  text: string;
  type: "text" | "multipleChoice" | "checkbox" | "dropdown";
  required: boolean;
  options?: string[] | null;
};

export type Answer = {
  id: string;
  value: string;
  questionId: string;
};

export type Response = {
  id: string;
  createdAt: string;
  answers: Answer[];
};
