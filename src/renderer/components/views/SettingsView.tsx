import React from 'react';
import { AppSettings } from '../../types';
import { Settings, Keyboard, Shield, Cpu } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onChangeSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onChangeSettings,
}) => {
  return (
    <div className="tab-content">
      {/* Simulation Behavior Settings */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Cpu size={16} color="var(--accent-light)" />
            <span>Hardware Keystroke Engine & Replay Settings</span>
          </span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Input Speed Velocity (WPM)</label>
            <input
              type="number"
              min="10"
              max="240"
              value={settings.defaultWpm}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  defaultWpm: Math.max(10, Number(e.target.value) || 65),
                })
              }
            />
            <span className="form-help">Speed at which OS-level key events are dispatched into the active window.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Human Jitter Variance (±%)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={settings.jitterVariance}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  jitterVariance: Math.max(0, Number(e.target.value) || 35),
                })
              }
            />
            <span className="form-help">Stochastic Gaussian delay variance per keyup/keydown to bypass aggressive bot-detection scripts.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Window Switch Buffer (Seconds)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.countdownBufferSeconds}
              onChange={(e) =>
                onChangeSettings({
                  ...settings,
                  countdownBufferSeconds: Math.max(1, Number(e.target.value) || 2),
                })
              }
            />
            <span className="form-help">Delay buffer before keystrokes begin, giving you time to focus your editor window.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Punctuation Pause Simulation</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.enablePunctuationPauses}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    enablePunctuationPauses: e.target.checked,
                  })
                }
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-main)' }}
              />
              <span>Pause slightly on periods, commas, and line breaks</span>
            </label>
            <span className="form-help">Replicates biological thinking pauses when reaching ends of sentences.</span>
          </div>
        </div>
      </div>

      {/* Global Hotkeys Reference */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Keyboard size={16} color="var(--accent-light)" />
            <span>Global Shortcuts & Safety Controls</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Trigger / Arm Typer</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Begins the 2s buffer countdown and starts typing active payload</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <kbd style={{ padding: '4px 8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>F9</kbd>
              <span style={{ color: 'var(--text-muted)' }}>or</span>
              <kbd style={{ padding: '4px 8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>Ctrl+Shift+Space</kbd>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#fca5a5' }}>Emergency Killswitch (Stop)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Immediately aborts simulated keystrokes mid-word</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <kbd style={{ padding: '4px 8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>F10</kbd>
              <span style={{ color: 'var(--text-muted)' }}>or</span>
              <kbd style={{ padding: '4px 8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>Ctrl+Shift+Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
