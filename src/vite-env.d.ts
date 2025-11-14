/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_MALLS: string
  readonly VITE_N8N_WEBHOOK_CAMPAIGNS_GET: string
  readonly VITE_N8N_WEBHOOK_CAMPAIGNS_POST: string
  readonly VITE_N8N_WEBHOOK_CAMPAIGNS_DELETE: string
  readonly VITE_N8N_WEBHOOK_QR_CHECKIN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
