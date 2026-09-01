import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import * as path from 'path';
import * as robot from 'robotjs';
import { GoogleGenAI } from '@google/genai';

// Keep reference to the main window
let mainWindow: BrowserWindow | null = null;

// Application configuration state
interface TyperState {
  text: string;
  wpm: number;
  isArmed: boolean;
  isTyping: boolean;
  shouldStop: boolean;
}

const state: TyperState = {
  text: '',
  wpm: 65,
  isArmed: false,
  isTyping: false,
  shouldStop: false,
};

// Global shortcuts to register
const START_SHORTCUTS = ['F9', 'CommandOrControl+Shift+Space'];
const STOP_SHORTCUTS = ['F10', 'CommandOrControl+Shift+Escape'];

// Sleep helper
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

/**
 * Send status update safely to the renderer process
 */
function sendStatus(
  status:
    | 'idle'
    | 'armed'
    | 'countdown'
    | 'typing'
    | 'completed'
    | 'cancelled'
    | 'error',
  message?: string,
  extra?: {
    progress?: { current: number; total: number; percent: number };
    countdownSeconds?: number;
  }
) {
  console.log(`[Status] ${status}: ${message || ''}`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('status-change', {
      status,
      message,
      ...extra,
    });
  }
}

/**
 * Executes typing simulated character by character with human-like variance
 */
async function startTypingSimulation(): Promise<void> {
  if (state.isTyping) {
    console.log('Already typing, ignoring trigger.');
    return;
  }

  if (!state.text || state.text.trim().length === 0) {
    console.warn('No text loaded to type.');
    sendStatus('error', 'No text loaded. Please enter or generate text first.');
    return;
  }

  state.isTyping = true;
  state.shouldStop = false;
  console.log('Starting typing simulation for', state.text.length, 'characters.');

  // 2-second buffer window so the user can switch to their target application
  for (let remaining = 2; remaining > 0; remaining--) {
    if (state.shouldStop) {
      state.isTyping = false;
      sendStatus('cancelled', 'Typing aborted before start.');
      return;
    }
    sendStatus(
      'countdown',
      `Switch to target window! Starting in ${remaining}s...`,
      {
        countdownSeconds: remaining,
      }
    );
    await sleep(1000);
  }

  // Base delay per character derived from WPM:
  // Standard metric: 1 word ≈ 5 characters.
  // Characters per minute = wpm * 5.
  // Average ms per character = 60,000 / (wpm * 5) = 12,000 / wpm.
  const targetWpm = Math.max(10, Math.min(300, state.wpm || 65));
  const baseDelayMs = 12000 / targetWpm;

  // Robotjs configuration: disable built-in delay because we manage stochastic delays manually
  robot.setKeyboardDelay(0);

  sendStatus('typing', 'Typing in progress... Press F10 or Ctrl+Shift+Esc to stop.', {
    progress: { current: 0, total: state.text.length, percent: 0 },
  });

  const fullText = state.text;
  const totalLength = fullText.length;

  try {
    for (let i = 0; i < totalLength; i++) {
      if (state.shouldStop) {
        state.isTyping = false;
        sendStatus('cancelled', `Typing stopped at character ${i} of ${totalLength}.`);
        return;
      }

      const char = fullText[i];

      if (char === '\r') {
        // Skip carriage returns, handle standard newlines
        continue;
      } else if (char === '\n') {
        robot.keyTap('enter');
      } else if (char === '\t') {
        robot.keyTap('tab');
      } else {
        robot.typeString(char);
      }

      // Human-like variance calculation:
      // 1. Gaussian-like jitter: ±35% random variation around base delay
      // 2. Extra natural pause on sentence terminators (. ! ? \n) and punctuation (, ; :)
      let delay = baseDelayMs * (0.65 + Math.random() * 0.7);

      if (['.', '!', '?'].includes(char)) {
        // Sentence pause: 2x - 3.5x base delay
        delay += baseDelayMs * (1.5 + Math.random() * 1.5);
      } else if ([',', ';', ':'].includes(char)) {
        // Clause pause: 1x - 2x base delay
        delay += baseDelayMs * (0.5 + Math.random() * 1.0);
      } else if (char === ' ') {
        // Subtle word-break rhythm variation
        delay += baseDelayMs * (0.2 + Math.random() * 0.4);
      }

      // Progress reporting periodically (e.g. every 5 chars or on punctuation/last char)
      if (i % 5 === 0 || i === totalLength - 1) {
        const percent = Math.round(((i + 1) / totalLength) * 100);
        sendStatus('typing', `Typing: ${percent}% completed`, {
          progress: {
            current: i + 1,
            total: totalLength,
            percent,
          },
        });
      }

      await sleep(delay);
    }

    state.isTyping = false;
    sendStatus('completed', 'Finished typing entire payload!');
  } catch (err: any) {
    state.isTyping = false;
    console.error('Error during simulated typing:', err);
    sendStatus('error', `Typing error: ${err?.message || 'Unknown error'}`);
  }
}

/**
 * Creates the primary Electron BrowserWindow
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 780,
    minWidth: 640,
    minHeight: 600,
    title: 'Fake Worker - Human Typer Simulation',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
  const devServerUrl = 'http://localhost:5173';
  const reactDistPath = path.join(__dirname, '..', 'dist-react', 'index.html');

  if (isDev) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      mainWindow?.loadFile(reactDistPath);
    });
  } else if (require('fs').existsSync(reactDistPath)) {
    mainWindow.loadFile(reactDistPath);
  } else {
    // Fallback to src/index.html if build hasn't run yet
    mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Register global keyboard shortcuts for trigger/stop
 */
function registerShortcuts(): void {
  START_SHORTCUTS.forEach((shortcut) => {
    const ok = globalShortcut.register(shortcut, () => {
      console.log(`[Shortcut Triggered] ${shortcut}`);
      // If user hasn't clicked Arm, but has text, automatically arm and start!
      if (!state.isTyping) {
        state.isArmed = true;
        startTypingSimulation();
      }
    });
    console.log(`Shortcut ${shortcut} registered:`, ok);
  });

  STOP_SHORTCUTS.forEach((shortcut) => {
    const ok = globalShortcut.register(shortcut, () => {
      console.log(`[Shortcut Triggered] ${shortcut}`);
      if (state.isTyping) {
        state.shouldStop = true;
      }
    });
    console.log(`Shortcut ${shortcut} registered:`, ok);
  });
}

// Electron lifecycle hooks
app.whenReady().then(() => {
  createWindow();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Update text payload & WPM
ipcMain.handle('update-config', (_event, config: { text: string; wpm: number }) => {
  state.text = typeof config.text === 'string' ? config.text : '';
  state.wpm = Number(config.wpm) || 65;
  return { success: true };
});

// IPC Handler: Arm the typer
ipcMain.handle('arm-typer', () => {
  if (!state.text || state.text.trim().length === 0) {
    return { success: false, message: 'Please provide text to type before arming.' };
  }
  state.isArmed = true;
  sendStatus('armed', `Armed! Switch to your editor/input and press ${START_SHORTCUTS.join(' or ')} to begin.`);
  return {
    success: true,
    message: `Typer armed! Focus your target window and press ${START_SHORTCUTS.join(' or ')}. (Press ${STOP_SHORTCUTS.join(' or ')} anytime to cancel)`,
  };
});

// IPC Handler: Directly trigger typing
ipcMain.handle('start-typing', () => {
  state.isArmed = true;
  startTypingSimulation();
  return { success: true, message: 'Typing started.' };
});

// IPC Handler: Stop/abort typing
ipcMain.handle('stop-typing', () => {
  if (state.isTyping) {
    state.shouldStop = true;
    return { success: true, message: 'Stopping typer...' };
  }
  state.isArmed = false;
  sendStatus('idle', 'Typer disarmed.');
  return { success: true, message: 'Typer disarmed.' };
});

// IPC Handler: Gemini AI generation via @google/genai SDK (backend fallback)
ipcMain.handle(
  'generate-ai',
  async (_event, args: { prompt: string; apiKey?: string }) => {
    try {
      const apiKey = args.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error:
            'Missing Gemini API key. Provide it in the UI or set the GEMINI_API_KEY environment variable.',
        };
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: args.prompt,
      });

      const generatedText = response.text || '';
      return { success: true, text: generatedText };
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return {
        success: false,
        error: err?.message || 'Failed to generate content with Gemini.',
      };
    }
  }
);
