import { contextBridge, ipcRenderer } from 'electron';

export type TyperStatus =
  | 'idle'
  | 'armed'
  | 'countdown'
  | 'typing'
  | 'completed'
  | 'cancelled'
  | 'error';

export interface TyperConfig {
  text: string;
  wpm: number;
}

export interface StatusPayload {
  status: TyperStatus;
  message?: string;
  progress?: {
    current: number;
    total: number;
    percent: number;
  };
  countdownSeconds?: number;
}

export interface ElectronAPI {
  updateConfig: (config: TyperConfig) => Promise<{ success: boolean }>;
  armTyper: () => Promise<{ success: boolean; message: string }>;
  startTyping: () => Promise<{ success: boolean; message: string }>;
  stopTyping: () => Promise<{ success: boolean; message: string }>;
  onStatusChange: (callback: (payload: StatusPayload) => void) => () => void;
  generateAI: (
    prompt: string,
    apiKey?: string
  ) => Promise<{ success: boolean; text?: string; error?: string }>;
}

const electronAPI: ElectronAPI = {
  updateConfig: (config: TyperConfig) =>
    ipcRenderer.invoke('update-config', config),

  armTyper: () => ipcRenderer.invoke('arm-typer'),

  startTyping: () => ipcRenderer.invoke('start-typing'),

  stopTyping: () => ipcRenderer.invoke('stop-typing'),

  onStatusChange: (callback: (payload: StatusPayload) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      payload: StatusPayload
    ) => {
      callback(payload);
    };

    ipcRenderer.on('status-change', subscription);

    // Return an unsubscribe function for cleanup
    return () => {
      ipcRenderer.removeListener('status-change', subscription);
    };
  },

  generateAI: (prompt: string, apiKey?: string) =>
    ipcRenderer.invoke('generate-ai', { prompt, apiKey }),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
