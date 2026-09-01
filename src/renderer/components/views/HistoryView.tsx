import React from 'react';
import { HistoryItem } from '../../types';
import { Trash2, ArrowUpRight, Clock, FileText } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectPayload: (text: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectPayload,
  onDeleteItem,
  onClearAll,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Clock size={16} color="var(--accent-light)" />
            <span>Saved Payloads History</span>
          </span>
          {history.length > 0 && (
            <button
              className="btn btn-danger"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={onClearAll}
            >
              <Trash2 size={13} />
              <span>Clear All History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} strokeWidth={1.5} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No Typing History Yet
            </div>
            <p style={{ fontSize: '13px', maxWidth: '360px' }}>
              Whenever you generate an AI draft or execute typing in the Typer tab, it will be automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div
                  className="history-content"
                  onClick={() => onSelectPayload(item.text)}
                  title="Click to load into Typer"
                >
                  <div className="history-text-preview">
                    {item.preview}
                    {item.text.length > 140 ? '...' : ''}
                  </div>

                  <div className="history-meta">
                    <span className={`badge ${item.source === 'ai' ? 'badge-ai' : 'badge-manual'}`}>
                      {item.source === 'ai' ? '✨ Gemini AI' : 'Manual'}
                    </span>
                    <span>{item.charCount} chars (~{item.wordCount} words)</span>
                    <span>•</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>

                <div className="history-actions">
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => onSelectPayload(item.text)}
                    title="Load into Typer"
                  >
                    <ArrowUpRight size={14} />
                    <span>Load</span>
                  </button>

                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete item from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
