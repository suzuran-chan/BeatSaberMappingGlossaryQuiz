// app/page.tsx

'use client'; 

import { useState, useEffect } from 'react';
import ResultScreen from './components/ResultScreen';

// 型定義（app/lib/types.tsからインポートするのが望ましいです）
export interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  imageUrl?: string;
}
export type AnswerRecord = QuizItem & {
  selectedAnswer: string;
  isCorrect: boolean;
};


export default function Home() {
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);

  const fetchQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizData([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAnswerHistory([]);
    setIsQuizFinished(false);

    try {
      const response = await fetch('/api/quiz');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'クイズの読み込みに失敗しました。');
      }
      const data: QuizItem[] = await response.json();
      setQuizData(data);
    } catch (err) { // ★★★ ここを修正しました ★★★
      // 'err' の型を安全にチェックします
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer !== null) return;
    const answer = quizData[currentQuestionIndex].answer;
    const correct = option === answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
  };

  const handleNextQuestion = () => {
    const currentQuestion = quizData[currentQuestionIndex];
    setAnswerHistory(prev => [
      ...prev,
      { ...currentQuestion, selectedAnswer: selectedAnswer!, isCorrect: isCorrect! }
    ]);
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">Beat Saber Mapping用語クイズ</h1>
        <p className="text-xl">クイズを読み込み中...</p>
      </main>
    );
  }

  if (error) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">エラー</h1>
        <p className="text-xl mb-6">{error}</p>
         <button
            onClick={fetchQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            再挑戦
          </button>
      </main>
    );
  }

  if (isQuizFinished) {
    return <ResultScreen answerHistory={answerHistory} onRetry={fetchQuiz} />;
  }

  if (quizData.length === 0 && !isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
         <h1 className="text-4xl font-bold mb-4">クイズの準備ができました</h1>
         <p className="text-lg mb-6 text-gray-400">下のボタンを押して開始してください。</p>
         <button onClick={fetchQuiz} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors">
            クイズを開始
        </button>
      </main>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-800 text-white p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-10">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 text-lg">
            <h1 className="font-bold text-cyan-400">Beat Saber Mapping用語クイズ</h1>
            <span>問題 {currentQuestionIndex + 1} / {quizData.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}></div>
          </div>
        </div>
        <div className="mb-8 p-4 bg-gray-800 rounded-lg min-h-[100px]">
          <p className="text-lg font-semibold mb-2">【問題】この説明に当てはまる用語は？</p>
          <p className="text-gray-300">{currentQuestion.question}</p>
        </div>
        {currentQuestion.imageUrl && (
          <div className="mb-8 flex justify-center items-center bg-gray-800 p-2 rounded-lg">
            <img
              src={currentQuestion.imageUrl}
              alt={`Example for ${currentQuestion.answer}`}
              className="max-h-60 w-auto object-contain rounded-md"
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const answer = quizData[currentQuestionIndex].answer;
            let buttonClass = 'bg-gray-700 hover:bg-gray-600';

            if (selectedAnswer !== null) {
              if (option === answer) {
                buttonClass = 'bg-green-600';
              } else if (isSelected) {
                buttonClass = 'bg-red-600';
              } else {
                buttonClass = 'bg-gray-700 opacity-50';
              }
            }
            
            return (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left p-4 rounded-lg font-medium transition-all duration-300 ${buttonClass}`}
              >
                {option}
              </button>
            )
          })}
        </div>
        {selectedAnswer && (
          <div className="text-center">
            <button
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              {currentQuestionIndex < quizData.length - 1 ? '次の問題へ' : '結果を見る'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}