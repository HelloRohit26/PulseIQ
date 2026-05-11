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
    <div className="relative min-h-screen w-full bg-[#050B14] overflow-hidden flex flex-col items-center pt-32 font-body selection:bg-blue-500/30 text-white">
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* 1. Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_20%,#000_70%,transparent_100%)] z-0"></div>
      
      {/* 2. The Glowing Earth Arc (Matching the image exactly) */}
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[250vw] sm:w-[150vw] lg:w-[120vw] aspect-square rounded-[100%] border-t-[2px] border-[#3b82f6]/80 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15)_0%,transparent_50%)] shadow-[0_-30px_100px_rgba(59,130,246,0.3)_inset] z-0 animate-pulse-slow"></div>

      {/* 3. Flowing Light on the Arc */}
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[250vw] sm:w-[150vw] lg:w-[120vw] aspect-square rounded-[100%] z-0 pointer-events-none drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]"
           style={{
             WebkitMaskImage: 'linear-gradient(to bottom, black 1%, transparent 15%)',
             maskImage: 'linear-gradient(to bottom, black 1%, transparent 15%)'
           }}>
         <div className="absolute inset-0 rounded-[100%] border-[15px] border-transparent animate-arc-light-sweep"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, rgba(0,229,255,0.6) 80%, rgba(0,229,255,1) 95%, rgba(255,255,255,1) 100%) border-box',
                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'destination-out',
                maskComposite: 'exclude'
              }}>
         </div>
      </div>

      <main className="relative z-10 flex flex-col items-center w-full max-w-[1200px] px-6 mt-16">

        {/* --- HEADLINE --- */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-center leading-[1.1] tracking-tight text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          High-performing market analysis.<br/>
          <span className="text-white/80 font-medium">The future of trading.</span>
        </h1>

        {/* --- SUBTITLE --- */}
        <p className="text-[17px] md:text-[20px] text-white/50 text-center max-w-[700px] leading-relaxed mb-10 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Powerful, AI-driven sentiment tools and analytics. Supercharge your portfolio & stay ahead of global markets from anywhere.
        </p>

        {/* --- BUTTONS --- */}
        <div className="flex flex-col sm:flex-row items-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link
            to="/architecture"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-[#0B0E14]/50 backdrop-blur-md text-white font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-[20px]">play_circle</span>
            Watch Demo
          </Link>
          <a
            href="/login/index.html"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#2563EB] text-white font-medium hover:bg-[#3B82F6] transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] w-full sm:w-auto"
          >
            Get started for free
          </a>
        </div>

        {/* --- TRUSTED BY --- */}
        <div className="mt-20 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-[12px] text-white/40 uppercase tracking-widest font-semibold mb-8">Trusted by 500+ hedge funds</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">token</span> Boltshift</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">deployed_code</span> Lightbox</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">layers</span> FeatherDev</div>
            <div className="flex items-center gap-2 text-xl font-bold font-headline"><span className="material-symbols-outlined text-[28px]">language</span> GlobalBank</div>
          </div>
        </div>

        {/* --- BOTTOM DASHBOARD MOCKUP (LIVE) --- */}
        <div className="mt-24 w-full max-w-[1050px] relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {/* Blue glow behind dashboard */}
          <div className="absolute -inset-4 bg-gradient-to-t from-blue-600/30 to-transparent blur-3xl rounded-t-full z-0"></div>
          
          <div className="relative z-10 w-full h-[400px] bg-[#0A0A0A]/90 backdrop-blur-xl rounded-t-2xl border-t border-x border-white/10 shadow-[0_-30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transform perspective-1000 rotate-x-[2deg]">
            
            {/* Browser Header */}
            <div className="h-12 w-full bg-[#1A1A1A] border-b border-white/5 flex items-center px-5 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              <div className="mx-auto px-6 py-1.5 rounded-md bg-black/40 border border-white/5 text-[11px] text-white/30 tracking-widest uppercase font-semibold">PulseIQ Terminal</div>
            </div>
            
            {/* Fake Content (Live Graph) */}
            <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.1)_0%,transparent_60%)] pointer-events-none"></div>
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Global Sentiment Heatmap</h3>
                  <p className="text-sm text-white/40 font-medium">Real-time analysis of 12,400+ active streams</p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live
                  </div>
                </div>
              </div>
              
              {/* Live Bar Chart */}
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden flex items-end p-6 gap-3 z-10">
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
    </div>
  );
}
