/// <reference path="./types/electron-window.d.ts" />

// Elements
const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
const promptInput = document.getElementById('promptInput') as HTMLInputElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const payloadText = document.getElementById('payloadText') as HTMLTextAreaElement;
const charCount = document.getElementById('charCount') as HTMLSpanElement;
const wpmInput = document.getElementById('wpmInput') as HTMLInputElement;
const armBtn = document.getElementById('armBtn') as HTMLButtonElement;
const directStartBtn = document.getElementById('directStartBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const statusBadge = document.getElementById('statusBadge') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const progressContainer = document.getElementById('progressContainer') as HTMLDivElement;
const progressMessage = document.getElementById('progressMessage') as HTMLSpanElement;
const progressPercentage = document.getElementById('progressPercentage') as HTMLSpanElement;
const progressFill = document.getElementById('progressFill') as HTMLDivElement;
const presetPills = document.querySelectorAll<HTMLButtonElement>('.preset-pill');

// Update character and word count statistics
function updateStats(): void {
  const text = payloadText.value || '';
  const characters = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  charCount.textContent = `${characters} character${characters === 1 ? '' : 's'} (~${words} word${words === 1 ? '' : 's'})`;
}

// Sync configuration to main process via IPC
async function syncConfigToMain(): Promise<void> {
  const text = payloadText.value;
  const wpm = parseInt(wpmInput.value, 10) || 65;
  await window.electronAPI.updateConfig({ text, wpm });
}

// Update status badge UI styling
function setStatusUI(
  status: 'idle' | 'armed' | 'countdown' | 'typing' | 'completed' | 'cancelled' | 'error',
  label: string
): void {
  statusBadge.className = `status-badge ${status}`;
  statusText.textContent = label;

  if (status === 'typing' || status === 'countdown') {
    progressContainer.classList.add('active');
    armBtn.disabled = true;
    directStartBtn.disabled = true;
    stopBtn.disabled = false;
  } else if (status === 'armed') {
    armBtn.disabled = true;
    directStartBtn.disabled = false;
    stopBtn.disabled = false;
  } else {
    armBtn.disabled = false;
    directStartBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// Attach preset prompt helpers
presetPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    const prompt = pill.getAttribute('data-prompt');
    if (prompt) {
      promptInput.value = prompt;
      promptInput.focus();
    }
  });
});

// Call Gemini API via @google/genai SDK (with fallback to backend IPC)
async function generateWithGemini(): Promise<void> {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert('Please enter a prompt for the AI to generate.');
    promptInput.focus();
    return;
  }

  const userKey = apiKeyInput.value.trim();
  generateBtn.disabled = true;
  const originalBtnContent = generateBtn.innerHTML;
  generateBtn.innerHTML = '<span>⏳ Generating...</span>';
  setStatusUI('idle', 'Generating AI text...');

  try {
    // Generate text via the Electron main process bridge (which has @google/genai loaded)
    const res = await window.electronAPI.generateAI(prompt, userKey || undefined);
    if (!res.success) {
      throw new Error(res.error || 'Failed to generate text.');
    }
    const generatedContent = res.text || '';

    if (generatedContent) {
      payloadText.value = generatedContent;
      updateStats();
      await syncConfigToMain();
      setStatusUI('idle', 'AI text generated successfully');
    }
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    alert(`AI Generation Failed: ${err?.message || 'Unknown error'}`);
    setStatusUI('error', 'AI Generation Error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalBtnContent;
  }
}

// Setup input listeners
payloadText.addEventListener('input', () => {
  updateStats();
  syncConfigToMain();
});

wpmInput.addEventListener('change', () => {
  let val = parseInt(wpmInput.value, 10);
  if (isNaN(val) || val < 10) val = 10;
  if (val > 300) val = 300;
  wpmInput.value = val.toString();
  syncConfigToMain();
});

generateBtn.addEventListener('click', generateWithGemini);

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateWithGemini();
  }
});

// Arm Typer button handler
armBtn.addEventListener('click', async () => {
  const text = payloadText.value.trim();
  if (!text) {
    alert('Please enter or generate some text to type first!');
    payloadText.focus();
    return;
  }

  // Ensure current text and WPM settings are saved to backend
  await syncConfigToMain();

  // Arm in backend
  const result = await window.electronAPI.armTyper();
  if (result.success) {
    setStatusUI('armed', 'Armed (Press F9 or Ctrl+Shift+Space)');
  } else {
    alert(result.message);
  }
});

// Direct Start button handler: saves config and starts immediately (with 2s countdown buffer)
directStartBtn.addEventListener('click', async () => {
  const text = payloadText.value.trim();
  if (!text) {
    alert('Please enter or generate some text to type first!');
    payloadText.focus();
    return;
  }

  await syncConfigToMain();
  await window.electronAPI.startTyping();
});

// Stop Typer button handler
stopBtn.addEventListener('click', async () => {
  await window.electronAPI.stopTyping();
  setStatusUI('idle', 'Idle');
  progressContainer.classList.remove('active');
  progressFill.style.width = '0%';
});

// Listen for status events from Electron main process
window.electronAPI.onStatusChange((payload) => {
  const { status, message, progress, countdownSeconds } = payload;

  switch (status) {
    case 'armed':
      setStatusUI('armed', 'Armed (Press F9)');
      break;

    case 'countdown':
      setStatusUI(
        'countdown',
        `Starting in ${countdownSeconds}s... (Switch window!)`
      );
      progressContainer.classList.add('active');
      progressMessage.textContent = message || 'Switch to target window!';
      progressPercentage.textContent = `${countdownSeconds}s`;
      break;

    case 'typing':
      setStatusUI('typing', 'Typing in progress (F10 to abort)');
      progressContainer.classList.add('active');
      if (progress) {
        progressMessage.textContent = `Typing: ${progress.current} / ${progress.total} characters`;
        progressPercentage.textContent = `${progress.percent}%`;
        progressFill.style.width = `${progress.percent}%`;
      }
      break;

    case 'completed':
      setStatusUI('completed', 'Completed!');
      progressContainer.classList.add('active');
      progressPercentage.textContent = '100%';
      progressFill.style.width = '100%';
      progressMessage.textContent = message || 'Finished typing!';
      setTimeout(() => {
        setStatusUI('idle', 'Idle');
        progressContainer.classList.remove('active');
        progressFill.style.width = '0%';
      }, 4000);
      break;

    case 'cancelled':
      setStatusUI('cancelled', 'Stopped');
      progressMessage.textContent = message || 'Typing cancelled.';
      setTimeout(() => {
        setStatusUI('idle', 'Idle');
        progressContainer.classList.remove('active');
      }, 3000);
      break;

    case 'error':
      setStatusUI('error', 'Error');
      alert(`Typer Error: ${message}`);
      break;

    default:
      setStatusUI('idle', 'Idle');
      break;
  }
});

// Initialize stats and sync
updateStats();
syncConfigToMain();
