// app/lib/types.ts

// クイズ1問分の基本的なデータの型
export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  imageUrl?: string;
}

// 回答記録用の型（QuizItemにユーザーの回答と正誤情報を追加）
export type AnswerRecord = QuizItem & {
  selectedAnswer: string;
  isCorrect: boolean;
};