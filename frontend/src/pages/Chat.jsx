import { useState, useRef, useEffect } from 'react';
import { queryPulseIQ } from '../services/api';

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-on-surface font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-container-high px-1.5 py-0.5 rounded text-accent-electric text-sm">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'SESSION INITIATED: ' + new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const res = await queryPulseIQ(question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: [
            { name: 'Reuters Finance', impact: 'High Impact', sentiment: 'positive', time: '12m ago' },
            { name: 'Bloomberg Terminal', impact: 'Bullish Signal', sentiment: 'positive', time: '28m ago' },
            { name: 'TechInsights Data', impact: 'Neutral', sentiment: 'neutral', time: '45m ago' },
          ],
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'I encountered an error processing your request. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] relative bg-background/50">
      {/* Dot Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Chat History */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-(--spacing-container-margin) pb-32 flex flex-col gap-8 z-10">
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="flex justify-center w-full animate-fade-in-up">
                <span className="font-ticker text-[14px] font-bold text-on-surface-variant border border-border-subtle bg-surface px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex flex-col items-end gap-2 max-w-4xl self-end animate-slide-in-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Executive User</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">account_circle</span>
                </div>
                <div className="bg-surface-container-high border border-border-subtle px-6 py-4 rounded-xl rounded-tr-none text-on-surface font-body text-[15px]">
                  {msg.content}
                </div>
              </div>
            );
          }
          // Assistant
          return (
            <div key={i} className="flex flex-col items-start gap-3 max-w-5xl self-start w-full animate-fade-in-up">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-sm text-accent-electric" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <span className="font-body text-[12px] font-semibold tracking-[0.05em] text-accent-electric uppercase">PulseIQ Gemini Node</span>
              </div>
              <div className="text-on-surface font-body text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              {/* Source Citations */}
              {msg.sources && (
                <div className="w-full mt-4">
                  <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">plagiarism</span>
                    Source Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {msg.sources.map((src, j) => (
                      <div key={j} className="bg-surface border border-border-subtle rounded-lg p-(--spacing-card-padding) flex flex-col justify-between hover:border-accent-electric/50 transition-colors group cursor-pointer">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-ticker text-[14px] font-bold text-on-surface">{src.name}</span>
                            <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              src.sentiment === 'positive' ? 'bg-sentiment-positive/10 border border-sentiment-positive/20' : 'bg-sentiment-neutral/10 border border-sentiment-neutral/20'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${src.sentiment === 'positive' ? 'bg-sentiment-positive' : 'bg-sentiment-neutral'}`}></div>
                              <span className={`font-body text-[12px] font-semibold tracking-[0.05em] ${src.sentiment === 'positive' ? 'text-sentiment-positive' : 'text-sentiment-neutral'}`}>
                                {src.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                          <span className="font-body text-[12px] font-semibold tracking-[0.05em] text-outline">{src.time}</span>
                          <span className="material-symbols-outlined text-outline group-hover:text-accent-electric transition-colors">open_in_new</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 self-start mt-2">
            <div className="typing-dot w-2 h-2 bg-accent-electric rounded-full"></div>
            <div className="typing-dot w-2 h-2 bg-accent-electric rounded-full"></div>
            <div className="typing-dot w-2 h-2 bg-accent-electric rounded-full"></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-(--spacing-container-margin) pt-12 bg-gradient-to-t from-background via-background/90 to-transparent backdrop-blur-[2px] z-20">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-accent-electric/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-surface-container-high border border-border-subtle rounded-xl overflow-hidden shadow-lg">
            <button className="pl-4 pr-2 text-on-surface-variant hover:text-accent-electric transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              className="w-full bg-transparent border-none text-on-surface font-body text-[16px] py-4 focus:outline-none placeholder-outline-variant"
              placeholder="Query the PulseIQ intelligence network..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="pr-2 flex items-center gap-1">
              <button className="p-2 text-on-surface-variant hover:text-accent-electric transition-colors rounded-lg hover:bg-surface-variant">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-accent-electric text-background rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center mr-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
          <div className="text-center mt-2 font-body text-[10px] text-outline-variant tracking-wider uppercase">
            Gemini AI can make mistakes. Verify critical market data independently.
          </div>
        </div>
      </div>
    </div>
  );
}
