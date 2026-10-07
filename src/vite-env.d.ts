/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APIGATE_URL?: string;
  readonly VITE_SYLIUS_API_URL?: string;
  readonly VITE_MEDUSA_URL?: string;
  readonly VITE_MEDUSA_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
