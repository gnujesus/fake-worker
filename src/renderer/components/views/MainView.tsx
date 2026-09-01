import React, { useState, useEffect } from 'react';
import { StatusPayload } from '../../../preload';
import { Sparkles, Zap, ShieldAlert, Square } from 'lucide-react';
import { HistoryItem } from '../../types';

interface MainViewProps {
  payload: string;
  onChangePayload: (text: string) => void;
  wpm: number;
  onChangeWpm: (wpm: number) => void;
  status: StatusPayload;
  onSaveToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  apiKey: string;
  licenseKey: string;
}

export const MainView: React.FC<MainViewProps> = ({
  payload,
  onChangePayload,
  wpm,
  onChangeWpm,
  status,
  onSaveToHistory,
  apiKey,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to Electron main process whenever payload or wpm changes
  useEffect(() => {
    window.electronAPI?.updateConfig({ text: payload, wpm });
  }, [payload, wpm]);

  const characters = payload.length;
  const words = payload.trim() === '' ? 0 : payload.trim().split(/\s+/).length;

  const handleStart = async () => {
    if (!payload.trim()) {
      alert('Please enter or generate some text to type first.');
      return;
    }
    setErrorMessage(null);
    onSaveToHistory({
      text: payload,
      wordCount: words,
      charCount: characters,
      source: 'manual',
      preview: payload.slice(0, 140),
    });
    await window.electronAPI?.startTyping();
  };

  const handleArm = async () => {
    if (!payload.trim()) {
      alert('Please enter or generate some text to type first.');
      return;
    }
    setErrorMessage(null);
    onSaveToHistory({
      text: payload,
      wordCount: words,
      charCount: characters,
      source: 'manual',
      preview: payload.slice(0, 140),
    });
    await window.electronAPI?.armTyper();
  };

  const handleStop = async () => {
    await window.electronAPI?.stopTyping();
  };

  const handleGenerateAI = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await window.electronAPI?.generateAI(activePrompt, apiKey);
      if (res.success && res.text) {
        onChangePayload(res.text);
        const wCount = res.text.trim().split(/\s+/).length;
        onSaveToHistory({
          text: res.text,
          wordCount: wCount,
          charCount: res.text.length,
          source: 'ai',
          preview: res.text.slice(0, 140),
        });
      } else {
        setErrorMessage(res.error || 'Failed to generate text.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isBusy = status.status === 'typing' || status.status === 'countdown';

  return (
    <div className="tab-content">
      {/* AI Synthetic Test Data Section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Sparkles size={16} color="var(--accent-light)" />
            <span>Synthetic Test Case & Input Generator</span>
          </span>
          <span className="card-meta">Gemini 2.5 Flash QA Engine</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="e.g. Generate realistic user registration payload with edge-case characters..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
            disabled={isGenerating}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleGenerateAI()}
            disabled={isGenerating || !prompt.trim()}
          >
            <Sparkles size={15} />
            <span>{isGenerating ? 'Generating...' : 'Generate Data'}</span>
          </button>
        </div>

        {errorMessage && (
          <div style={{ color: '#fca5a5', fontSize: '12px' }}>
            ⚠ {errorMessage}
          </div>
        )}

        {/* Preset quick test datasets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick test data:</span>
          {[
            'Generate a 500-word realistic customer review containing emojis and quotes for form stress-testing.',
            'Generate a valid multi-step JSON checkout session payload with mock items and addresses.',
            'Generate a realistic engineering incident postmortem report with markdown tables.',
          ].map((text, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => {
                setPrompt(text);
                handleGenerateAI(text);
              }}
              disabled={isGenerating}
            >
              {idx === 0 ? 'User Review Form' : idx === 1 ? 'Checkout JSON' : 'Incident Report'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Keystroke Test Payload */}
      <div className="card" style={{ flex: 1 }}>
        <div className="card-header">
          <span className="card-title">Active Replay Payload (Input Buffer)</span>
          <span className="card-meta">
            {characters} characters (~{words} words)
          </span>
        </div>

        <textarea
          placeholder="Paste or write test input data here, or generate synthetic payloads with Gemini above..."
          value={payload}
          onChange={(e) => onChangePayload(e.target.value)}
          disabled={isBusy}
        />
      </div>

      {/* Speed & Controls */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          {/* WPM Speed Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Speed: <strong style={{ color: 'var(--accent-light)' }}>{wpm} WPM</strong>
            </span>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={wpm}
              onChange={(e) => onChangeWpm(Number(e.target.value))}
              disabled={isBusy}
              style={{ flex: 1, accentColor: 'var(--accent-main)' }}
            />
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={handleStart}
              disabled={isBusy || !payload.trim()}
              title="Runs native keystroke simulation into target window after 2s countdown"
            >
              <Zap size={16} />
              <span>⚡ Execute Test (2s Delay)</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleArm}
              disabled={isBusy || !payload.trim()}
              title="Arm replay hotkey and press F9 or Ctrl+Shift+Space inside your target web/desktop application"
            >
              <ShieldAlert size={16} />
              <span>Arm Hotkey (F9)</span>
            </button>

            <button
              className="btn btn-danger"
              onClick={handleStop}
              disabled={!isBusy}
              title="Emergency abort test execution immediately"
            >
              <Square size={15} />
              <span>Abort Test (F10)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
