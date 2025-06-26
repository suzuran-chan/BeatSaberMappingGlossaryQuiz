// next.config.ts

import type { NextConfig } from 'next';

// リポジトリ名をここに設定
const repositoryName = 'BeatSaberMappingGlossaryQuiz';

const nextConfig: NextConfig = {
  // 静的サイトとして出力する設定
  output: 'export',
  
  // GitHub Pages用の設定
  basePath: `/${repositoryName}`,
  assetPrefix: `/${repositoryName}/`,
  
  // 画像のドメイン設定（外部サイトの画像を使うために必要）
  images: {
    unoptimized: true, // 静的エクスポートではNext.jsの画像最適化は使えない
  },
};

module.exports = nextConfig;