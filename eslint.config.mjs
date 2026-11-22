import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// 레이어 경계 규칙, 상세 설명은 docs/architecture.md
const OPENAI_ONLY_IN_INFRA = {
  group: ["openai", "openai/*"],
  message: "OpenAI SDK는 src/infra/openai에서만 사용",
};
const FEATURE_INTERNALS = {
  group: ["@/features/*/*", "!@/features/*/server"],
  message: "다른 기능은 @/features/{기능명} 또는 @/features/{기능명}/server 진입점으로만 참조",
};
const SERVER_ONLY_MODULES = {
  group: [
    "@/infra/**",
    "@/config/**",
    "@/features/*/server",
    "**/service",
    "**/repository",
    "**/agent/**",
  ],
  message: "UI 컴포넌트에서 서버 전용 모듈 import 금지, 데이터는 props나 API 호출로 전달",
};
const UPPER_LAYERS = {
  group: ["@/features/**", "@/app/**"],
  message: "하위 계층(infra·shared·config)은 상위 계층을 참조하지 않음",
};

const restrict = (...patterns) => ["error", { patterns }];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
      "no-restricted-imports": restrict(OPENAI_ONLY_IN_INFRA, FEATURE_INTERNALS),
    },
  },
  {
    files: ["src/features/**/components/**", "src/shared/ui/**"],
    rules: {
      "no-restricted-imports": restrict(
        OPENAI_ONLY_IN_INFRA,
        FEATURE_INTERNALS,
        SERVER_ONLY_MODULES,
      ),
    },
  },
  {
    files: ["src/infra/**", "src/shared/**", "src/config/**"],
    rules: {
      "no-restricted-imports": restrict(OPENAI_ONLY_IN_INFRA, UPPER_LAYERS),
    },
  },
  {
    files: ["src/shared/ui/**"],
    rules: {
      "no-restricted-imports": restrict(OPENAI_ONLY_IN_INFRA, UPPER_LAYERS, SERVER_ONLY_MODULES),
    },
  },
  {
    files: ["src/infra/openai/**"],
    rules: {
      "no-restricted-imports": restrict(UPPER_LAYERS),
    },
  },
  {
    files: ["src/shared/util/logger.ts"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "planning/**",
    "submission/**",
  ]),
]);

export default eslintConfig;
