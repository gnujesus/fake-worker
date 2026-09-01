import React from 'react';
import { ScanText, Eye, CheckCircle2 } from 'lucide-react';

interface InputRecognitionViewProps {
  payload: string;
  onChangePayload: (text: string) => void;
  wpm: number;
  onChangeWpm: (wpm: number) => void;
  apiKey: string;
  licenseKey: string;
}

export const InputRecognitionView: React.FC<InputRecognitionViewProps> = ({
  payload,
  onChangePayload,
  wpm,
  onChangeWpm,
  apiKey,
  licenseKey,
}) => {
  return (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ScanText size={16} color="var(--accent-light)" />
            <span>Automated Input Field & Form Recognition</span>
          </span>
          <span className="card-meta">Smart DOM & Accessibility Parser</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Inspect active windows, form controls, and target inputs to verify compatibility with native hardware keystroke injection.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Eye size={16} color="var(--accent-light)" />
            <span>Active Target Inspector</span>
          </span>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Cursor & Hardware Event Listener Active</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Current active replay buffer: {payload.length} characters ({payload.trim() === '' ? 0 : payload.trim().split(/\s+/).length} words) ready at {wpm} WPM.
          </p>
        </div>
      </div>
    </div>
  );
};