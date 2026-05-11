export default function Architecture() {
  return (
    <div className="p-(--spacing-container-margin) overflow-y-auto relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-electric/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary-container/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-headline text-[32px] font-semibold text-on-surface mb-2">PulseIQ Architecture</h1>
          <p className="font-body text-[16px] text-on-surface-variant max-w-2xl">
            High-velocity data ingestion, real-time sentiment analysis, and vectorized retrieval pipeline. A robust microservices architecture designed for absolute minimum latency.
          </p>
        </div>

        {/* Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-(--spacing-gutter)">
          {/* Data Ingestion */}
          <div className="lg:col-span-3 flex flex-col gap-(--spacing-gutter)">
            <ArchCard
              icon="rss_feed"
              iconColor="text-accent-electric"
              title="Data Sources"
              glowOnHover
            >
              <ul className="space-y-2 font-body text-[13px] text-on-surface-variant">
                {['Global News APIs', 'SEC Filings', 'Social Sentiment Streams'].map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-electric"></span> {s}
                  </li>
                ))}
              </ul>
            </ArchCard>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
            <div className="w-full h-[1px] bg-border-subtle relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-border-subtle rotate-45"></div>
            </div>
          </div>

          {/* Streaming & Processing */}
          <div className="lg:col-span-4 flex flex-col gap-(--spacing-gutter)">
            <div className="bg-surface rounded-xl p-(--spacing-card-padding) border border-accent-electric/20 relative group shadow-[0_0_15px_rgba(0,229,255,0.03)]">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-electric/5 via-transparent to-transparent opacity-50 rounded-xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center border border-accent-electric/30">
                    <span className="material-symbols-outlined text-accent-electric text-[18px]">stream</span>
                  </div>
                  <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-accent-electric uppercase">Apache Kafka</h3>
                </div>
                <span className="text-[10px] bg-accent-electric/10 text-accent-electric px-2 py-0.5 rounded-full font-ticker font-bold">REAL-TIME</span>
              </div>
              <p className="font-body text-[13px] text-on-surface-variant relative z-10 mb-4">High-throughput event streaming platform buffering incoming data spikes and ensuring sequential processing.</p>
              <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-accent-electric w-3/4 animate-pulse"></div>
              </div>
            </div>

            <ArchCard icon="api" iconColor="text-primary-fixed-dim" title="FastAPI Handlers">
              <div className="grid grid-cols-2 gap-2">
                <StatBox label="Latency" value="~12ms" valueColor="text-sentiment-positive" />
                <StatBox label="Throughput" value="5k req/s" valueColor="text-on-surface" />
              </div>
            </ArchCard>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
            <div className="w-full h-[1px] bg-border-subtle relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-border-subtle rotate-45"></div>
            </div>
          </div>

          {/* Intelligence & Storage */}
          <div className="lg:col-span-3 flex flex-col gap-(--spacing-gutter)">
            <ArchCard icon="psychology" iconColor="text-secondary-container" title="Gemini AI Model" hasGlow>
              <p className="font-body text-[13px] text-on-surface-variant relative z-10">Deep semantic analysis, entity extraction, and financial sentiment scoring on raw text streams.</p>
            </ArchCard>
            <ArchCard icon="database" iconColor="text-outline-variant" title="Vector DB & PgSQL">
              <div className="flex flex-col gap-2">
                {['Embeddings', 'Relational Data'].map((item) => (
                  <div key={item} className="flex justify-between items-center bg-surface-container-low px-3 py-1.5 rounded border border-border-subtle">
                    <span className="font-body text-[10px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">{item}</span>
                    <span className="material-symbols-outlined text-[14px] text-accent-electric">check_circle</span>
                  </div>
                ))}
              </div>
            </ArchCard>
          </div>
        </div>

        {/* Bottom UI Tier */}
        <div className="mt-12 pt-12 border-t border-border-subtle relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
            <span className="material-symbols-outlined text-border-subtle">arrow_downward</span>
          </div>
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-(--spacing-card-padding) flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent-electric/5 blur-[50px] rounded-full"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-accent-electric/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <span className="material-symbols-outlined text-accent-electric text-[24px]">dashboard</span>
              </div>
              <div>
                <h3 className="font-headline text-[20px] font-semibold text-on-surface">PulseIQ Dashboard Client</h3>
                <p className="font-body text-[13px] text-on-surface-variant">React / WebSockets / Tailwind CSS</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <div className="flex flex-col items-end">
                <span className="font-ticker text-[12px] text-on-surface-variant">Avg Client Latency</span>
                <span className="font-ticker text-[18px] text-accent-electric font-bold">&lt; 50ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchCard({ icon, iconColor, title, children, glowOnHover, hasGlow }) {
  return (
    <div className={`bg-surface rounded-xl p-(--spacing-card-padding) border border-border-subtle relative overflow-hidden group ${glowOnHover ? 'hover:border-accent-electric/30 transition-colors' : ''}`}>
      {hasGlow && <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 blur-[30px] rounded-full"></div>}
      {glowOnHover && <div className="absolute inset-0 bg-gradient-to-br from-surface-tint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center border border-border-subtle">
          <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
        </div>
        <h3 className="font-body text-[12px] font-semibold tracking-[0.05em] text-on-surface uppercase">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StatBox({ label, value, valueColor }) {
  return (
    <div className="bg-surface-container-low p-2 rounded border border-border-subtle text-center">
      <span className="font-ticker text-[11px] text-on-surface-variant block">{label}</span>
      <span className={`font-ticker text-[14px] font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
