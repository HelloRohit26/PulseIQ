import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function HeroLanding() {
  // Live Dashboard Simulation State
  const [bars, setBars] = useState(Array(24).fill(0).map(() => Math.random() * 80 + 10));

  useEffect(() => {
    // Make the dashboard bars "live"
    const interval = setInterval(() => {
      setBars(prev => prev.map(val => {
        let newVal = val + (Math.random() - 0.5) * 30;
        return Math.min(Math.max(newVal, 10), 100);
      }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050B14] overflow-hidden flex flex-col items-center pt-20 sm:pt-32 font-body selection:bg-blue-500/30 text-white">
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* 1. Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_20%,#000_70%,transparent_100%)] z-0"></div>
      
      {/* 2. The Earth Arc — the orb IS the border glowing, no separate element visible */}
      <div className="animate-orb-sweep" style={{ position: 'absolute', top: '180px', left: '50%', transform: 'translateX(-50%)', width: '120vw', aspectRatio: '1', borderRadius: '100%', borderTop: '2px solid rgba(59,130,246,0.4)', background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 50%)', zIndex: 0, transformOrigin: '50% 50%' }}>
        
        {/* Seamless glow — solid fill + heavy blur = no dot, no hole, just pure light */}
        <div className="animate-orb-glow" style={{ position: 'absolute', top: '0px', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0,229,255,0.6)', filter: 'blur(25px)', zIndex: 10 }}>
        </div>
      </div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-[1200px] px-4 sm:px-6 mt-8 sm:mt-16">

        {/* --- HEADLINE --- */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-center leading-[1.1] tracking-tight text-white mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          High-performing market analysis.<br/>
          <span className="text-white/80 font-medium">The future of trading.</span>
        </h1>

        {/* --- SUBTITLE --- */}
        <p className="text-[14px] sm:text-[17px] md:text-[20px] text-white/50 text-center max-w-[700px] leading-relaxed mb-8 sm:mb-10 font-light animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
          Powerful, AI-driven sentiment tools and analytics. Supercharge your portfolio & stay ahead of global markets from anywhere.
        </p>

        {/* --- BUTTONS --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="/login/index.html"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#3B82F6] transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] w-full sm:w-auto"
          >
            Get started for free
          </a>
        </div>

        {/* --- TRUSTED BY --- */}
        <div className="mt-12 sm:mt-20 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-[12px] text-white/40 uppercase tracking-widest font-semibold mb-8">Trusted by 500+ hedge funds</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">token</span> Boltshift</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">deployed_code</span> Lightbox</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">layers</span> FeatherDev</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">language</span> GlobalBank</div>
          </div>
        </div>

        {/* --- BOTTOM DASHBOARD MOCKUP (LIVE) --- */}
        <div className="mt-16 sm:mt-24 w-full max-w-[1050px] relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {/* Blue glow behind dashboard */}
          <div className="absolute -inset-4 bg-gradient-to-t from-blue-600/30 to-transparent blur-3xl rounded-t-full z-0"></div>
          
          <div className="relative z-10 w-full h-[280px] sm:h-[400px] bg-[#0A0A0A]/90 backdrop-blur-xl rounded-t-2xl border-t border-x border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transform perspective-1000 rotate-x-[2deg]">
            
            {/* Browser Header */}
            <div className="h-12 w-full bg-[#1A1A1A] border-b border-white/5 flex items-center px-5 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              <div className="mx-auto px-6 py-1.5 rounded-md bg-black/40 border border-white/5 text-[11px] text-white/30 tracking-widest uppercase font-semibold">PulseIQ Terminal</div>
            </div>
            
            {/* Fake Content (Live Graph) */}
            <div className="flex-1 p-4 sm:p-8 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.1)_0%,transparent_60%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-end mb-4 sm:mb-8 relative z-10">
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 tracking-tight">Global Sentiment Heatmap</h3>
                  <p className="text-xs sm:text-sm text-white/40 font-medium">Real-time analysis of 12,400+ active streams</p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live
                  </div>
                </div>
              </div>
              
              {/* Live Bar Chart */}
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden flex items-end p-3 sm:p-6 gap-1 sm:gap-3 z-10">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(37,99,235,0.05)_100%)] pointer-events-none"></div>
                {bars.map((h, i) => {
                  const isPeak = h > 85;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm transition-all duration-[200ms] ease-linear relative group ${isPeak ? 'bg-blue-400' : 'bg-[#2563EB]/40 hover:bg-[#2563EB]/70'}`} 
                      style={{ height: `${h}%` }}
                    >
                       <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-300 opacity-50"></div>
                       {isPeak && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20">
                            ALERT
                          </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* --- FOOTER CREDIT --- */}
      <footer className="relative z-10 w-full py-8 mt-auto">
        <div className="flex flex-col items-center gap-3">
          {/* Crafted by line */}
          <div className="flex items-center gap-2 group">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20 group-hover:to-blue-400/40 transition-colors"></div>
            <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-semibold group-hover:text-white/50 transition-colors">
              Designed & Developed by
            </p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20 group-hover:to-blue-400/40 transition-colors"></div>
          </div>
          <a href="#" className="text-[15px] font-headline font-bold tracking-wide text-white/60 hover:text-blue-400 transition-all duration-300 relative group">
            Rohit Maurya
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-500"></span>
          </a>
          <p className="text-[10px] text-white/20 tracking-wider">© 2026 PulseIQ • All rights reserved</p>
        </div>
      </footer>

    </div>
  );
}
