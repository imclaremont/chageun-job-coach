import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// iCloud 동기화 제외 구성(scripts/icloud-nosync.sh)에서는 실제 산출물 폴더를 직접 지정
// 링크를 거치면 개발 서버가 산출물 변경을 소스 변경으로 감지해 화면을 계속 새로 고침
const distDir = existsSync(".next.nosync") ? ".next.nosync" : ".next";

const nextConfig: NextConfig = {
  distDir,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
