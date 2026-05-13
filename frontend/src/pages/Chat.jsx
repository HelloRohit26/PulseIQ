import { useState, useRef, useEffect } from 'react';
import { queryPulseIQ } from '../services/api';

/* ─── Enhanced Markdown → HTML renderer ─── */
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headings: ### → h3, ## → h2, # → h1
    .replace(/^### (.+)$/gm, '<h4 class="chat-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="chat-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="chat-h2">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="chat-bold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="chat-italic">$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="chat-code-inline">$1</code>')
    // Bullet points: - or *
    .replace(/^[\-\*] (.+)$/gm, '<li class="chat-li">$1</li>')
    // Numbered list
    .replace(/^\d+\.\s(.+)$/gm, '<li class="chat-li chat-li-num">$1</li>')
    // Double newline = paragraph break
    .replace(/\n\n/g, '</p><p class="chat-para">')
    // Single newline
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li class="chat-li">.*?<\/li>\s*(?:<br\/>)?)+)/g, '<ul class="chat-ul">$1</ul>');
  html = html.replace(/((?:<li class="chat-li chat-li-num">.*?<\/li>\s*(?:<br\/>)?)+)/g, '<ol class="chat-ol">$1</ol>');
  // Clean stray <br/> inside lists
  html = html.replace(/<\/li>\s*<br\/>\s*/g, '</li>');

  return `<p class="chat-para">${html}</p>`;
}

/* ─── Typing Animation Component ─── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-4xl animate-fade-in-up" id="typing-indicator">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric/20 to-secondary/20 border border-accent-electric/30 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[18px] text-accent-electric" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-accent-electric/70 uppercase tracking-wider font-body">Analyzing</span>
          <div className="flex items-center gap-1 ml-1">
            <div className="typing-dot w-1.5 h-1.5 bg-accent-electric rounded-full"></div>
            <div className="typing-dot w-1.5 h-1.5 bg-accent-electric rounded-full"></div>
            <div className="typing-dot w-1.5 h-1.5 bg-accent-electric rounded-full"></div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-3 w-40 bg-surface-container-high rounded-full animate-pulse"></div>
          <div className="h-3 w-24 bg-surface-container-high rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-3 w-56 bg-surface-container-high rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen({ onSuggestionClick }) {
  const suggestions = [
    { icon: 'trending_up', label: 'Market Analysis', query: 'What are the top market trends today?' },
    { icon: 'security', label: 'Threat Intel', query: 'Are there any emerging geopolitical threats affecting markets?' },
    { icon: 'analytics', label: 'Sentiment Check', query: 'What is the current market sentiment across major sectors?' },
    { icon: 'bolt', label: 'Breaking News', query: 'Summarize the most impactful news from the last 24 hours' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in-up z-10" id="welcome-screen">
      {/* Logo Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-electric/10 to-secondary/10 border border-accent-electric/20 flex items-center justify-center backdrop-blur-sm">
          <span className="material-symbols-outlined text-[40px] text-accent-electric" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sentiment-positive border-2 border-background flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-2 text-center">
        Deep Pulse <span className="text-accent-electric">Intelligence</span>
      </h1>
      <p className="font-body text-sm text-on-surface-variant text-center max-w-md mb-10 leading-relaxed">
        Ask anything about global markets, geopolitics, sentiment analysis, and emerging threats. Powered by Gemini AI.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.query)}
            className="group flex items-center gap-3 bg-surface/80 border border-border-subtle rounded-xl px-4 py-3.5
                       hover:border-accent-electric/40 hover:bg-surface-container-high/60 transition-all duration-300
                       text-left cursor-pointer active:scale-[0.97]"
            id={`suggestion-${i}`}
          >
            <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center
                            group-hover:border-accent-electric/30 group-hover:bg-accent-electric/10 transition-all duration-300 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-accent-electric transition-colors">
                {s.icon}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-body text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="font-body text-[13px] text-on-surface/80 truncate">{s.query}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Single Message Component ─── */
function ChatMessage({ msg, index }) {
  const [copied, setCopied] = useState(false);
  const time = msg.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // System message
  if (msg.role === 'system') {
    return (
      <div className="flex justify-center w-full animate-fade-in-up my-2" id={`msg-system-${index}`}>
        <span className="font-body text-[11px] text-on-surface-variant/60 border border-border-subtle/50 bg-surface/40 px-4 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {msg.content}
        </span>
      </div>
    );
  }

  // User message
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end animate-slide-in-right" id={`msg-user-${index}`}>
        <div className="flex flex-col items-end gap-1.5 max-w-[85%] md:max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-body text-[10px] text-on-surface-variant/50 tracking-wider">{time}</span>
            <span className="font-body text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider">You</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-border-subtle flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">person</span>
            </div>
          </div>
          <div className="bg-accent-electric/10 border border-accent-electric/20 px-5 py-3.5 rounded-2xl rounded-tr-sm text-on-surface font-body text-[14.5px] leading-relaxed shadow-lg shadow-accent-electric/5">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start gap-3 animate-fade-in-up max-w-full" id={`msg-ai-${index}`}>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-electric/20 to-secondary/20 border border-accent-electric/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-accent-electric/10">
        <span className="material-symbols-outlined text-[18px] text-accent-electric" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
      </div>

      <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-[11px] font-bold text-accent-electric uppercase tracking-wider">PulseIQ AI</span>
          <span className="w-1 h-1 rounded-full bg-accent-electric/40"></span>
          <span className="font-body text-[10px] text-on-surface-variant/50 tracking-wider">{time}</span>
        </div>

        {/* Response Body */}
        <div className="bg-surface/60 border border-border-subtle/60 rounded-2xl rounded-tl-sm px-5 py-4 md:px-6 md:py-5 shadow-lg backdrop-blur-sm">
          <div className="chat-response-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

          {/* Action Bar */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border-subtle/40">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-on-surface-variant/60 hover:text-accent-electric hover:bg-accent-electric/10 transition-all duration-200 cursor-pointer"
              title="Copy response"
              id={`copy-btn-${index}`}
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              <span className="text-[11px] font-semibold tracking-wider uppercase font-body">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Source Citations */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">link</span>
              <span className="font-body text-[10px] font-semibold text-on-surface-variant/50 uppercase tracking-widest">Sources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {msg.sources.map((src, j) => (
                <div
                  key={j}
                  className="flex items-center gap-2 bg-surface/40 border border-border-subtle/40 rounded-lg px-3 py-2 hover:border-accent-electric/30 transition-colors cursor-pointer group"
                  id={`source-${index}-${j}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    src.sentiment === 'positive' ? 'bg-sentiment-positive' : src.sentiment === 'negative' ? 'bg-sentiment-negative' : 'bg-sentiment-neutral'
                  }`}></div>
                  <span className="font-body text-[12px] text-on-surface-variant group-hover:text-on-surface transition-colors">{src.name}</span>
                  <span className="font-body text-[10px] text-outline/50">{src.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Chat Component ─── */
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (overrideMsg) => {
    const question = (overrideMsg || input).trim();
    if (!question || isLoading) return;
    setInput('');

    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Add system message on first query
    if (messages.length === 0) {
      setMessages([
        { role: 'system', content: 'Session started · ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
        { role: 'user', content: question, timestamp: now },
      ]);
    } else {
      setMessages((prev) => [...prev, { role: 'user', content: question, timestamp: now }]);
    }

    setIsLoading(true);

    try {
      const res = await queryPulseIQ(question);
      const aiTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          timestamp: aiTime,
          sources: [
            { name: 'Reuters Finance', impact: 'High Impact', sentiment: 'positive', time: '12m ago' },
            { name: 'Bloomberg Terminal', impact: 'Bullish Signal', sentiment: 'positive', time: '28m ago' },
            { name: 'TechInsights Data', impact: 'Neutral', sentiment: 'neutral', time: '45m ago' },
          ],
        },
      ]);
    } catch {
      const errTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I encountered an error processing your request. Please try again.', timestamp: errTime },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] relative bg-background/50" id="chat-container">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#00E5FF 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}
      />

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto pb-40 z-10">
        {!hasMessages ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} index={i} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full z-20" id="chat-input-area">
        <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-10 pb-4 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Input Box */}
            <div className="relative group">
              {/* Glow border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-electric/30 via-secondary/20 to-accent-electric/30 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-end bg-surface-container-high/90 border border-border-subtle rounded-2xl overflow-hidden shadow-2xl shadow-black/30 backdrop-blur-md">
                <textarea
                  ref={inputRef}
                  className="w-full bg-transparent border-none text-on-surface font-body text-[15px] py-4 pl-5 pr-2 focus:outline-none placeholder-outline-variant/60 resize-none min-h-[56px] max-h-[160px]"
                  placeholder="Ask PulseIQ anything..."
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  id="chat-input"
                />
                <div className="pr-3 pb-3 flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="w-10 h-10 bg-accent-electric text-background rounded-xl hover:bg-primary-fixed transition-all duration-200 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-accent-electric cursor-pointer active:scale-90"
                    id="send-button"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isLoading ? 'hourglass_top' : 'arrow_upward'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-2.5">
              <span className="font-body text-[10px] text-outline-variant/50 tracking-wider">
                PulseIQ AI can make mistakes · Verify critical data independently
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Response Styles (injected here for scoping) */}
      <style>{`
        .chat-response-body {
          color: #dce4e5;
          font-family: 'Work Sans', sans-serif;
          font-size: 14.5px;
          line-height: 1.75;
          word-break: break-word;
        }
        .chat-response-body .chat-para {
          margin-bottom: 6px;
        }
        .chat-response-body .chat-para:last-child {
          margin-bottom: 0;
        }
        .chat-response-body .chat-h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #00E5FF;
          margin: 16px 0 8px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(48, 54, 61, 0.5);
        }
        .chat-response-body .chat-h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #c3f5ff;
          margin: 14px 0 6px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-response-body .chat-h3::before {
          content: '';
          width: 3px;
          height: 16px;
          background: #00E5FF;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .chat-response-body .chat-h4 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #9cf0ff;
          margin: 12px 0 4px 0;
        }
        .chat-response-body .chat-bold {
          color: #ffffff;
          font-weight: 600;
        }
        .chat-response-body .chat-italic {
          color: #bac9cc;
          font-style: italic;
        }
        .chat-response-body .chat-code-inline {
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.15);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          color: #00E5FF;
        }
        .chat-response-body .chat-ul,
        .chat-response-body .chat-ol {
          margin: 8px 0;
          padding-left: 0;
          list-style: none;
        }
        .chat-response-body .chat-li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 6px;
          line-height: 1.65;
        }
        .chat-response-body .chat-ul .chat-li::before {
          content: '';
          position: absolute;
          left: 4px;
          top: 10px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #00E5FF;
        }
        .chat-response-body .chat-ol {
          counter-reset: chat-counter;
        }
        .chat-response-body .chat-li-num {
          counter-increment: chat-counter;
        }
        .chat-response-body .chat-li-num::before {
          content: counter(chat-counter) '.';
          position: absolute;
          left: 0;
          top: 0;
          font-weight: 700;
          color: #00E5FF;
          font-size: 13px;
          font-family: 'Space Grotesk', sans-serif;
          width: auto;
          height: auto;
          border-radius: 0;
          background: none;
        }
      `}</style>
    </div>
  );
}
