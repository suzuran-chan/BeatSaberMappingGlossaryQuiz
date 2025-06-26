// app/api/quiz/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { QuizItem } from '@/app/lib/types'; // 型定義をインポート

export async function GET() {
  try {
    const url = 'https://bsmg.wiki/mapping/glossary.html';
    const baseUrl = 'https://bsmg.wiki';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(data);
    const allTerms: Omit<QuizItem, 'options'>[] = [];

    $('main table tbody tr').each((_, element) => {
      const term = $(element).find('td:first-child strong').text().trim();
      const descriptionCell = $(element).find('td:nth-child(2)');
      const description = descriptionCell.clone().find('details').remove().end().text().trim();
      const imageElement = descriptionCell.find('details img');
      let imageUrl: string | undefined = undefined;

      if (imageElement.length > 0) {
        const src = imageElement.attr('src');
        if (src && src.startsWith('/')) { imageUrl = `${baseUrl}${src}`; }
      }
      if (term && description) {
        allTerms.push({ question: description, answer: term, imageUrl });
      }
    });

    if (allTerms.length < 10) {
      return NextResponse.json({ error: 'Not enough terms' }, { status: 500 });
    }
    
    const shuffledTerms = [...allTerms].sort(() => 0.5 - Math.random());
    const selectedTerms = shuffledTerms.slice(0, 10);

    const quizData: QuizItem[] = selectedTerms.map(correctTerm => {
      const wrongOptions = allTerms
        .filter(t => t.answer !== correctTerm.answer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(t => t.answer);
      const options = [correctTerm.answer, ...wrongOptions].sort(() => 0.5 - Math.random());
      return { ...correctTerm, options };
    });
    
    return NextResponse.json(quizData);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}