# WINGS Frontend

WINGS는 React + TypeScript + Vite 기반의 퍼스널컬러 진단 서비스입니다.

## 제품 명세

기능 작업은 구현 전에 [`specs/`](./specs)에서 명세와 수용 기준을 먼저 확정합니다. 현재 부스 운영 흐름의 기준은 [`001-booth-guest-diagnosis.md`](./specs/001-booth-guest-diagnosis.md)입니다.

```bash
npm run dev
```

## 사주 분석 로컬 실행

사주 계산과 사주 해석은 API 키를 보호하기 위해 Vercel Function(`/api/sazu`)에서만 실행합니다.

1. `.env.example`을 복사해 `.env.local`을 만들고 `GEMINI_API_KEY`를 설정합니다. `VITE_` 또는 `REACT_APP_` 접두사는 사용하지 않습니다.
2. Vercel에 로그인한 뒤 `npx vercel dev`로 실행합니다. `npm run dev`만 실행하면 서버 함수는 동작하지 않습니다.
3. `/sazu`에서 입력·결과·오류 흐름을 확인합니다.

Vercel 배포 환경에는 `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 Development·Preview·Production에 각각 등록한 후 재배포합니다. `GEMINI_API_KEY`는 사주 계산 결과의 자연어 해석에만 서버 사이드에서 사용합니다. `SUPABASE_SERVICE_ROLE_KEY`는 부스 guest 기록을 저장하는 서버 함수에서만 사용하며 브라우저에 노출하면 안 됩니다.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
