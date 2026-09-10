import { useState, useEffect } from 'react';
import { getTelegramConfig, saveTelegramConfig, sendTelegramTestAlert } from '../services/api';

export default function TelegramAlertsModal({ isOpen, onClose }) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [minConfidence, setMinConfidence] = useState(85);
  const [isEnabled, setIsEnabled] = useState(true);
  const [savedConfig, setSavedConfig] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function load() {
        const conf = await getTelegramConfig();
        setSavedConfig(conf);
        if (conf.chat_id) setChatId(conf.chat_id);
        if (conf.min_confidence) setMinConfidence(conf.min_confidence);
        setIsEnabled(conf.is_enabled !== false);
      }
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    const res = await saveTelegramConfig({
      bot_token: botToken,
      chat_id: chatId,
      is_enabled: isEnabled,
      min_confidence: minConfidence
    });
    setSaving(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Telegram configuration saved successfully!' });
      setSavedConfig(prev => ({ ...prev, configured: true, masked_token: botToken ? 'SAVED' : '' }));
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to save config.' });
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    const res = await sendTelegramTestAlert({
      bot_token: botToken,
      chat_id: chatId
    });
    setTesting(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: '🚀 Test alert sent! Please check your Telegram chat.' });
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Error sending test message.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in" id="telegram-modal">
      <div className="bg-surface border border-accent-electric/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-2 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-sky-400 text-[28px]">send</span>
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
              Telegram Alpha Alerts <span className="text-sky-400">Live Bot</span>
            </h2>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Receive high-conviction breakout signals and breaking black-swan alerts directly on your phone in real time.
            </p>
          </div>
        </div>

        {/* Visual Step-by-Step Setup Guide */}
        <div className="bg-surface-container-low border border-border-subtle/80 rounded-2xl p-4 flex flex-col gap-3 font-body text-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-accent-electric text-[11px] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">help</span>
            How To Setup in 60 Seconds (100% Free):
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-[11px]">
            <div className="bg-surface/80 p-3 rounded-xl border border-border-subtle/50 flex flex-col justify-between gap-1">
              <span className="text-accent-electric font-bold">Step 1: Open BotFather</span>
              <p className="text-on-surface-variant font-body text-[11px]">
                Search <strong className="text-on-surface">@BotFather</strong> on Telegram and send message <code className="text-sky-400">/newbot</code>.
              </p>
            </div>

            <div className="bg-surface/80 p-3 rounded-xl border border-border-subtle/50 flex flex-col justify-between gap-1">
              <span className="text-accent-electric font-bold">Step 2: Copy Token</span>
              <p className="text-on-surface-variant font-body text-[11px]">
                BotFather gives you a token like <code className="text-sky-400">71234:AA...xyz</code>. Copy and paste it below.
              </p>
            </div>

            <div className="bg-surface/80 p-3 rounded-xl border border-border-subtle/50 flex flex-col justify-between gap-1">
              <span className="text-accent-electric font-bold">Step 3: Get Chat ID</span>
              <p className="text-on-surface-variant font-body text-[11px]">
                Message <strong className="text-on-surface">@userinfobot</strong> to get your numeric ID (e.g. <code className="text-sky-400">987654321</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {statusMsg && (
          <div className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {statusMsg.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-outline uppercase font-semibold">Telegram Bot Token</label>
              {savedConfig && savedConfig.masked_token && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Configured: {savedConfig.masked_token}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="Paste Bot Token (e.g. 7123456789:ABCDefgh-12345xyz...)"
                value={botToken}
                onChange={e => setBotToken(e.target.value)}
                className="w-full bg-surface-container border border-border-subtle rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-outline uppercase font-semibold block mb-1">Your Telegram Chat ID</label>
            <input
              type="text"
              placeholder="e.g. 123456789 (from @userinfobot)"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              className="w-full bg-surface-container border border-border-subtle rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-surface-container-low rounded-xl border border-border-subtle/50">
            <div>
              <div className="font-semibold text-on-surface">Minimum Conviction Threshold</div>
              <div className="text-[11px] text-on-surface-variant font-body">Only dispatch alerts when AI confidence meets or exceeds this score.</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="70"
                max="95"
                step="5"
                value={minConfidence}
                onChange={e => setMinConfidence(parseInt(e.target.value))}
                className="accent-accent-electric cursor-pointer"
              />
              <span className="font-bold text-accent-electric w-10 text-right">{minConfidence}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? 'Saving...' : 'Save Bot Settings'}
            </button>

            <button
              type="button"
              onClick={handleSendTest}
              disabled={testing || (!botToken && (!savedConfig || !savedConfig.configured))}
              className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-sky-400/40 text-sky-400 hover:text-white font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              {testing ? 'Sending...' : '⚡ Send Test Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
