export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  summary: string;
  flashcards: Flashcard[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
