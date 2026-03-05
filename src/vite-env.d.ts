/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string;
  readonly VITE_GAME_BASE_URL: string;
  readonly VITE_GAME_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
