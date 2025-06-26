// app/components/ResultScreen.tsx

import type { AnswerRecord } from '@/app/lib/types'; 

// このコンポーネントが受け取るプロパティの型定義
interface ResultScreenProps {
  answerHistory: AnswerRecord[];
  onRetry: () => void;
}

export default function ResultScreen({ answerHistory, onRetry }: ResultScreenProps) {
  // 正解数を計算
  const score = answerHistory.filter(record => record.isCorrect).length;
  const totalQuestions = answerHistory.length;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-800 text-white p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        {/* スコアとリトライボタン */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-10 text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">クイズ終了！</h1>
          <p className="text-3xl mb-6">
            あなたのスコア: <span className="text-cyan-400 font-bold">{score}</span> / {totalQuestions}
          </p>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
          >
            もう一度挑戦する
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">結果詳細</h2>
        
        {/* 各問題の結果をループで表示 */}
        <div className="space-y-6">
          {answerHistory.map((record, index) => (
            <div key={index} className={`bg-gray-900 rounded-2xl shadow-lg p-6 border-l-4 ${record.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <p className="text-sm text-gray-400 mb-2">問題 {index + 1}</p>
              <p className="mb-4 text-gray-200">{record.question}</p>
              
              {record.imageUrl && (
                <div className="my-4 flex justify-center items-center bg-gray-800 p-2 rounded-lg">
                  <img src={record.imageUrl} alt={`Example for ${record.answer}`} className="max-h-48 w-auto object-contain rounded-md" />
                </div>
              )}

              <div className="space-y-2 mt-4">
                {record.options.map(option => {
                  const isCorrectAnswer = option === record.answer;
                  const isSelectedAnswer = option === record.selectedAnswer;

                  let style = 'bg-gray-700/80'; // デフォルト
                  if (isCorrectAnswer) {
                    style = 'bg-green-700/50 ring-2 ring-green-500';
                  }
                  if (isSelectedAnswer && !record.isCorrect) {
                    style = 'bg-red-700/50 ring-2 ring-red-500 line-through';
                  }

                  return (
                    <div key={option} className={`p-3 rounded-lg flex justify-between items-center text-left transition-all ${style}`}>
                      <span>{option}</span>
                      {isSelectedAnswer && (
                        <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-gray-600">あなたの回答</span>
                      )}
                      {isCorrectAnswer && !isSelectedAnswer && (
                         <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-green-800">正解</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}