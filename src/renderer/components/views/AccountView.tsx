import React from 'react';
import { AccountState } from '../../types';
import { User, Key, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

interface AccountViewProps {
  account: AccountState;
  onChangeAccount: (newAccount: AccountState) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  account,
  onChangeAccount,
}) => {
  return (
    <div className="tab-content">
      {/* Active Tier Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <User size={16} color="var(--accent-light)" />
            <span>Subscription & License Tier</span>
          </span>
          <span
            className={`badge ${
              account.licenseKey.trim() ? 'badge-ai' : 'badge-manual'
            }`}
          >
            {account.licenseKey.trim()
              ? '★ Cloud AI Pro ($5/mo)'
              : 'Standalone / BYO API Key'}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {account.licenseKey.trim()
            ? 'Your Cloud AI Pro subscription is active. You have full access to zero-configuration AI ghostwriting powered by Gemini 2.5 Flash.'
            : 'You are using the standalone app. You can provide your personal Gemini API key below, or upgrade to Cloud AI Pro ($5/month) to get built-in AI without having to supply your own key.'}
        </p>
      </div>

      {/* Cloud AI License Key ($5/mo tier) */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Zap size={16} color="var(--accent-light)" />
            <span>Cloud AI Pro License Key ($5/mo)</span>
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">License Key</label>
          <input
            type="text"
            placeholder="e.g. FW-PRO-7A1C-9E2B-04F1-5C8D"
            value={account.licenseKey}
            onChange={(e) =>
              onChangeAccount({
                ...account,
                licenseKey: e.target.value,
                tier: e.target.value.trim() ? 'cloud_pro' : 'free',
              })
            }
          />
          <span className="form-help">
            Purchased a $5/month Cloud AI subscription? Enter your license key here to unlock zero-configuration AI ghostwriting without needing your own Google API key.
          </span>
        </div>
      </div>

      {/* BYO Gemini API Key (Standalone tier) */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Key size={16} color="var(--accent-light)" />
            <span>Bring Your Own Google Gemini API Key (Optional)</span>
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Personal Gemini API Key</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={account.apiKey}
            onChange={(e) =>
              onChangeAccount({
                ...account,
                apiKey: e.target.value,
              })
            }
          />
          <span className="form-help">
            If you do not have a Cloud AI Pro subscription, you can get a free API key from{' '}
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}
            >
              Google AI Studio <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
            </a>.
          </span>
        </div>
      </div>
    </div>
  );
};
