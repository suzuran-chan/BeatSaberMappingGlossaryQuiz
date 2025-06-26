// app/page.tsx

import axios from 'axios';
import * as cheerio from 'cheerio';
import QuizClient from './components/QuizClient';
import type { QuizItem } from '@/app/lib/types';

async function fetchAllTerms(): Promise<QuizItem[]> {
  try {
    const url = 'https://bsmg.wiki/mapping/glossary.html';
    const baseUrl = 'https://bsmg.wiki';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(data);
    const allTerms: QuizItem[] = [];

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
        // QuizItemの型に合わせて、正しいプロパティ名でオブジェクトを作成します。
        // description → question, term → answer
        allTerms.push({
          question: description, 
          answer: term, 
          imageUrl: imageUrl, 
          options: [] // optionsはクライアント側で生成するため空配列
        });
      }
    });
    
    return allTerms;

  } catch (error) {
    console.error('Failed to fetch terms during build:', error);
    return [];
  }
}

// ページの本体
export default async function Page() {
  const allTerms = await fetchAllTerms();
  return <QuizClient allTerms={allTerms} />;
}