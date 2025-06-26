// app/page.tsx

import axios from 'axios';
import * as cheerio from 'cheerio';
import QuizClient from './components/QuizClient'; // 作成したクライアントコンポーネントをインポート
import type { QuizItem } from '@/app/lib/types'; 

// スクレイピングとクイズ生成ロジックをここに移動
async function generateQuizData(): Promise<QuizItem[]> {
  try {
    const url = 'https://bsmg.wiki/mapping/glossary.html';
    const baseUrl = 'https://bsmg.wiki';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(data);
    const terms: { term: string; description: string; imageUrl?: string }[] = [];

    $('main table tbody tr').each((_, element) => {
      const term = $(element).find('td:first-child strong').text().trim();
      const descriptionCell = $(element).find('td:nth-child(2)');
      const description = descriptionCell.clone().find('details').remove().end().text().trim();
      const imageElement = descriptionCell.find('details img');
      let imageUrl: string | undefined = undefined;

      if (imageElement.length > 0) {
        const src = imageElement.attr('src');
        if (src && src.startsWith('/')) {
          imageUrl = `${baseUrl}${src}`;
        }
      }

      if (term && description) {
        terms.push({ term, description, imageUrl });
      }
    });

    if (terms.length < 10) {
      return []; // エラーの場合は空の配列を返す
    }

    const shuffledTerms = [...terms].sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, 10);

    const quizData: QuizItem[] = selectedTerms.map((correctTerm) => {
      const wrongOptions = terms
        .filter((t) => t.term !== correctTerm.term)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((t) => t.term);

      const options = [correctTerm.term, ...wrongOptions].sort(
        () => 0.5 - Math.random()
      );

      return {
        question: correctTerm.description,
        options: options,
        answer: correctTerm.term,
        imageUrl: correctTerm.imageUrl,
      };
    });
    
    return quizData;

  } catch (error) {
    console.error('Failed to generate quiz data during build:', error);
    return []; // エラーの場合は空の配列を返す
  }
}

// ページの本体。サーバーコンポーネントとしてビルド時に実行される
export default async function Page() {
  // ページがビルドされる時に一度だけクイズデータを生成
  const quizData = await generateQuizData();

  // 生成したデータをpropsとしてクライアントコンポーネントに渡す
  return <QuizClient initialQuizData={quizData} />;
}