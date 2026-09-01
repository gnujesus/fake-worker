/// <reference types="vite/client" />

import type { ElectronAPI, StatusPayload, TyperConfig, TyperStatus } from '../preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

export type { ElectronAPI, StatusPayload, TyperConfig, TyperStatus };
