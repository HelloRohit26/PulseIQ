import { Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   FIBONACCI PARTICLE GLOBE — 600-dot Holographic Color-Shifting Sphere
   ═══════════════════════════════════════════════════════════════ */
function FibonacciGlobe({ isDark }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsRef = useRef([]);
  const rotRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      canvas.width = r.width * window.devicePixelRatio;
      canvas.height = r.height * window.devicePixelRatio;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 600;
    if (dotsRef.current.length === 0) {
      for (let i = 0; i < COUNT; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / COUNT);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        dotsRef.current.push({
          phi, theta,
          r: 140 + Math.random() * 20,
          size: 0.8 + Math.random() * 1.4,
          alpha: 0.2 + Math.random() * 0.7,
        });
      }
    }

    const handleMouse = (e) => {
      const r = parent.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    };
    parent.addEventListener('mousemove', handleMouse);

    const W = () => canvas.width / window.devicePixelRatio;
    const H = () => canvas.height / window.devicePixelRatio;

    const draw = () => {
      const width = W(), height = H();
      ctx.clearRect(0, 0, width, height);
      rotRef.current += 0.0035;

      const cx = width / 2, cy = height / 2;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      const proj = dotsRef.current.map((d, index) => {
        const t = d.theta + rotRef.current;
        const x = d.r * Math.sin(d.phi) * Math.cos(t);
        const y = d.r * Math.cos(d.phi);
        const z = d.r * Math.sin(d.phi) * Math.sin(t);
        const sc = (z + d.r) / (2 * d.r);
        
        // Multi-color coordinate cycling
        const hue = (index * 0.6 + rotRef.current * 50) % 360;

        return {
          x: cx + x + mx * 15,
          y: cy + y + my * 10,
          z, 
          alpha: d.alpha * (0.2 + sc * 0.8),
          size: d.size * (0.35 + sc * 0.65),
          hue
        };
      });
      proj.sort((a, b) => a.z - b.z);

      proj.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 95%, 65%, ${p.alpha})`
          : `hsla(${p.hue}, 80%, 45%, ${p.alpha})`;
        ctx.fill();
        if (p.alpha > 0.55) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `hsla(${p.hue}, 95%, 65%, ${p.alpha * 0.12})`
            : `hsla(${p.hue}, 80%, 45%, ${p.alpha * 0.08})`;
          ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      parent.removeEventListener('mousemove', handleMouse);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[2] pointer-events-none" />;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER — Number rolls up on visibility
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const dur = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(eased * value);
      if (p >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON — Follows cursor with magnetic pull
   ═══════════════════════════════════════════════════════════════ */
function MagneticButton({ children, href, onClick, className = '' }) {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.25,
      y: (e.clientY - rect.top - rect.height / 2) * 0.25,
    });
  }, []);

  const Comp = href ? motion.a : motion.button;
  return (
    <Comp
      ref={btnRef}
      href={href}
      onClick={onClick}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {children}
    </Comp>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLOWING ORB — Morphing background orb
   ═══════════════════════════════════════════════════════════════ */
function GlowingOrb({ size, x, y, color, delay = 0, duration = 8 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(70px)',
      }}
      animate={{
        scale: [1, 1.4, 0.9, 1],
        opacity: [0.3, 0.65, 0.3, 0.3],
        x: [0, 45, -30, 0],
        y: [0, -35, 40, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPOTLIGHT BENTO CARD — Mouse spotlight glow enhancement
   ═══════════════════════════════════════════════════════════════ */
function SpotlightCard({ children, className = '', isDark }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-default ${className}`}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 opacity-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: isDark
                ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 242, 254, 0.12), rgba(255, 0, 127, 0.08), transparent 60%)`
                : `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(90, 32, 184, 0.08), rgba(0, 147, 163, 0.06), transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl border transition-all duration-300 z-10"
        style={{
          borderColor: isHovered 
            ? (isDark ? '#FF007F' : '#5A20B8') 
            : 'transparent',
          opacity: isHovered ? 0.35 : 0,
          boxShadow: isHovered 
            ? (isDark ? '0 0 25px rgba(255, 0, 127, 0.15)' : '0 0 20px rgba(90, 32, 184, 0.1)') 
            : 'none'
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SENTIMENT GAUGE — Live SVG dial gauge with sweeping needle
   ═══════════════════════════════════════════════════════════════ */
function SentimentGauge({ isDark }) {
  const [score, setScore] = useState(74);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => {
        const delta = (Math.random() - 0.5) * 16;
        return Math.min(Math.max(Math.round(prev + delta), 15), 95);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const rotation = (score / 100) * 180 - 90; // scale from -90 to 90 degrees

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-xl border h-full select-none ${
      isDark ? 'bg-black/35 border-white/5' : 'bg-white/50 border-[#E2DFE7]'
    }`}>
      <div className={`text-[10px] font-mono uppercase tracking-[0.25em] mb-4 ${isDark ? 'text-white/40' : 'text-[#64748B]'}`}>
        Live Sentiment Dial
      </div>

      <div className="relative w-40 h-24 flex items-center justify-center overflow-hidden">
        <svg className="absolute top-0 w-36 h-36" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF007F" />
              <stop offset="50%" stopColor="#FFE500" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
          </defs>
          <path
            d="M 12,50 A 38,38 0 0,1 88,50"
            fill="none"
            stroke={isDark ? '#1C1635' : '#E2DFE7'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 12,50 A 38,38 0 0,1 88,50"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="120"
            strokeDashoffset={120 - (120 * score) / 100}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className={`absolute bottom-0 w-5 h-5 rounded-full border-2 ${
          isDark ? 'bg-[#0E0A22] border-neon-cyan' : 'bg-white border-[#5A20B8]'
        }`} />

        <motion.div
          className="absolute bottom-2.5 w-[2px] h-11 origin-bottom bg-gradient-to-t from-red-500 via-orange-400 to-[#00F2FE]"
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 50, damping: 10 }}
          style={{ y: -5 }}
        />
      </div>

      <div className="mt-3 text-center">
        <div className="text-2xl font-bold font-mono text-gradient-colorful">{score}%</div>
        <div className={`text-[10px] font-bold uppercase tracking-wider ${
          score > 75 ? 'text-neon-cyan' : score > 50 ? 'text-neon-yellow' : 'text-neon-pink'
        }`}>
          {score > 75 ? 'Strong Sentiment' : score > 50 ? 'Moderate Positive' : 'Deficit / Neutral'}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEXT REVEAL — Word-by-word staggered reveal
   ═══════════════════════════════════════════════════════════════ */
function TextReveal({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  return (
    <motion.span className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.3em]">
          {word.split('').map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ opacity: 0, y: 40, rotateX: 90 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + wi * 0.08 + ci * 0.025,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HERO LANDING — Vibrant Cosmic Edition
   ═══════════════════════════════════════════════════════════════ */
export default function HeroLanding() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Live dashboard simulations
  const [bars, setBars] = useState(Array(20).fill(0).map(() => Math.random() * 80 + 10));
  const [streamCount, setStreamCount] = useState(12847);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(val => Math.min(Math.max(val + (Math.random() - 0.5) * 35, 10), 100)));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreamCount(12000 + Math.floor(Math.random() * 3000));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Scroll parallax effects
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const dashY = useTransform(scrollY, [200, 800], [0, -40]);

  const features = useMemo(() => [
    { icon: 'psychology', title: 'Neural Sentiment Engine', desc: 'Deep learning models analyze 50M+ data points per hour across global news, community feeds, and corporate statements.', gradient: 'from-[#00F2FE] to-[#7928CA]' },
    { icon: 'hub', title: 'Real-Time Threat Web', desc: 'Active semantic networks map correlations between events, corporate entities, and asset flows instantly.', gradient: 'from-[#FF007F] to-[#FFE500]' },
    { icon: 'auto_graph', title: 'Predictive Forecasting', desc: 'Transformer-based neural networks capture macro anomalies with 98.2% historical accuracy.', gradient: 'from-[#7928CA] to-[#FF007F]' },
  ], []);

  const metrics = useMemo(() => [
    { label: 'Alpha Velocity', value: '8.42σ', colorClass: 'text-neon-cyan' },
    { label: 'Liquidity Score', value: '92.4', colorClass: isDark ? 'text-white' : 'text-[#0D0A15]' },
    { label: 'Anomaly Tracker', value: 'ACTIVE', colorClass: 'text-neon-pink animate-glow-pink' },
    { label: 'Node Health', value: '99.9%', colorClass: isDark ? 'text-white' : 'text-[#0D0A15]' },
  ], [isDark]);

  const trustBrands = useMemo(() => [
    'QUANTUM.LTD', 'NEBULA_SEC', 'ALPHA_PRIME', 'SYNAPSE_VC', 'ZENITH.AI',
  ], []);

  const stats = useMemo(() => [
    { value: 500, suffix: '+', label: 'Institutional Funds', dotColor: 'bg-neon-cyan' },
    { value: 50, suffix: 'M+', label: 'Data Points Daily', dotColor: 'bg-neon-pink' },
    { value: 98.2, suffix: '%', label: 'Predictive Accuracy', dotColor: 'bg-neon-yellow', decimals: 1 },
    { value: 24, suffix: '/7', label: 'Real-Time Feeds', dotColor: 'bg-neon-cyan' },
  ], []);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex flex-col items-center font-body selection:bg-neon-pink/30 ${
      isDark ? 'bg-[#05020C] text-[#F8F7FF]' : 'bg-[#FAF9FC] text-[#0D0A15]'
    }`}>
      
      {/* ═══ INTERACTIVE BACKGROUND LAYERS ═══ */}
      <div className="absolute inset-0 z-[0] grid-mesh opacity-30 pointer-events-none" />

      {/* Morphing color gradients */}
      <GlowingOrb size={520} x="3%" y="10%" color={isDark ? 'rgba(0, 242, 254, 0.09)' : 'rgba(0, 242, 254, 0.05)'} duration={10} />
      <GlowingOrb size={420} x="68%" y="4%" color={isDark ? 'rgba(255, 0, 127, 0.07)' : 'rgba(255, 0, 127, 0.03)'} duration={12} delay={2} />
      <GlowingOrb size={360} x="45%" y="45%" color={isDark ? 'rgba(121, 40, 202, 0.08)' : 'rgba(121, 40, 202, 0.04)'} duration={8} delay={4} />

      {/* Subtle organic noise */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══════════════════════════════════════════
           SECTION 1: HERO — VIBRANT SPLIT + GLOBE
           ═══════════════════════════════════════════ */}
      <motion.section
        className="relative z-10 w-full max-w-[1400px] px-6 pt-20 sm:pt-28 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[90vh]"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Left column: Headings & CTA */}
        <div className="lg:col-span-5 z-10">
          <h1
            className="font-headline text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6"
            style={{ perspective: '1000px' }}
          >
            <span className={isDark ? 'text-white' : 'text-[#0D0A15]'}>
              <TextReveal text="The future of" delay={0.2} />
            </span>
            <br />
            <span className="text-gradient-colorful relative inline-block pb-2">
              <TextReveal text="market intel" delay={0.6} />
              <motion.span
                className="absolute bottom-0 left-0 h-[4px] rounded-full"
                style={{ background: 'linear-gradient(90deg, #00F2FE, #FF007F, #FFE500)' }}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
              />
            </span>
          </h1>

          <motion.p
            className={`text-base sm:text-lg max-w-[460px] leading-relaxed mb-10 ${
              isDark ? 'text-white/60' : 'text-[#494554]'
            }`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            PulseIQ deciphers global liquidity flows and micro anomalies using sub-second neural sentiment mapping. Real-time institutional terminal for the algorithmic era.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton
              href="/login/index.html"
              className="btn-neon-pink px-8 py-4 rounded-full font-extrabold text-[15px] inline-flex items-center gap-2"
            >
              Initiate Terminal
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </MagneticButton>

            <MagneticButton
              href="#features"
              className={`flex items-center gap-2 font-bold text-[15px] transition-all hover:gap-3 ${
                isDark ? 'text-neon-cyan' : 'text-[#0093A3]'
              }`}
            >
              View Network
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right column: Holographic globe */}
        <div className="lg:col-span-7 relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
          <FibonacciGlobe isDark={isDark} />

          {/* SVG coordinate rings */}
          <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[450px] lg:h-[450px]">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 animate-globe-rotate">
              <circle cx="50" cy="50" r="48" fill="none" stroke={isDark ? '#00F2FE' : '#5A20B8'} strokeWidth="0.25" strokeDasharray="3 3" />
              <ellipse cx="50" cy="50" rx="48" ry="8" fill="none" stroke={isDark ? '#FF007F' : '#0093A3'} strokeWidth="0.2" />
              <ellipse cx="50" cy="50" rx="48" ry="24" fill="none" stroke={isDark ? '#FFE500' : '#5A20B8'} strokeWidth="0.2" />
              <ellipse cx="50" cy="50" rx="8" ry="48" fill="none" stroke={isDark ? '#00F2FE' : '#FF007F'} strokeWidth="0.2" />
              <ellipse cx="50" cy="50" rx="24" ry="48" fill="none" stroke={isDark ? '#FF007F' : '#0093A3'} strokeWidth="0.2" />
            </svg>

            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-neon-pink rounded-full shadow-[0_0_15px_#FF007F] animate-node-pulse" />
              <div className="absolute bottom-[22%] -right-1 w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_15px_#00F2FE] animate-node-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="absolute bottom-[10%] left-[10%] w-2.5 h-2.5 bg-neon-yellow rounded-full shadow-[0_0_12px_#FFE500] animate-node-pulse" style={{ animationDelay: '0.8s' }} />
            </div>

            {/* Glowing core */}
            <div className="absolute inset-[20%] bg-gradient-to-tr from-neon-pink via-neon-cyan to-neon-purple opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           SECTION 2: BRANDS CONSTELLATION
           ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1200px] px-6 py-12">
        <motion.p
          className={`text-center text-[10px] uppercase tracking-[0.35em] font-semibold mb-8 font-mono ${
            isDark ? 'text-neon-cyan/50' : 'text-[#0093A3]/60'
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Trusted by Computational trading & security infrastructures
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-5 md:gap-8">
          {trustBrands.map((brand, i) => (
            <motion.div
              key={brand}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md cursor-default transition-all duration-300 ${
                isDark
                  ? 'bg-white/[0.02] border-white/[0.05] hover:border-neon-cyan/30'
                  : 'bg-white/60 border-black/[0.04] hover:border-[#5A20B8]/30'
              }`}
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -3, scale: 1.03 }}
            >
              <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-neon-pink' : i % 3 === 1 ? 'bg-neon-cyan' : 'bg-neon-yellow'}`} />
              <span className="font-headline font-bold text-xs tracking-wider">{brand}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 3: METRICS TERMINAL TICKER
           ═══════════════════════════════════════════ */}
      <motion.section
        className="relative z-10 w-full px-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="flex justify-center">
          <div className={`flex rounded-full border backdrop-blur-xl overflow-hidden shadow-2xl ${
            isDark
              ? 'bg-black/50 border-white/[0.06] shadow-black/80'
              : 'bg-white/70 border-black/[0.05]'
          }`}>
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={`px-6 sm:px-8 py-4 flex flex-col items-center text-center ${
                  i < metrics.length - 1 ? (isDark ? 'border-r border-white/5' : 'border-r border-black/5') : ''
                }`}
              >
                <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-1 opacity-40`}>
                  {m.label}
                </span>
                <span className={`text-base sm:text-xl font-bold font-mono ${m.colorClass}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           SECTION 4: 3D INTEGRATED DASHBOARD MOCKUP
           ═══════════════════════════════════════════ */}
      <motion.section
        className={`relative z-10 w-full py-20 ${isDark ? 'bg-[#090518]' : 'bg-[#EAE6EF]/40'}`}
        style={{ y: dashY }}
      >
        <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Text panel info */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="w-10 h-[3px] bg-gradient-to-r from-neon-pink to-neon-cyan mb-5 rounded-full" />
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              The AI Terminal.<br />
              <span className="text-gradient-colorful">Precision Decoded.</span>
            </h2>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-white/60' : 'text-[#494554]'}`}>
              PulseIQ's unified environment translates sub-second macro streams into clear indicators. Multi-channel intelligence built for active operations.
            </p>
            
            <div className="space-y-4">
              {[
                { title: 'Semantic Synthesizer', desc: 'Compresses thousands of text indices into actionable market coordinates.', color: 'text-neon-cyan' },
                { title: 'Vibe Velocity Core', desc: 'Calculates structural rates-of-change across global feeds.', color: 'text-neon-pink' },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDark ? 'bg-white/[0.04] border border-white/10' : 'bg-black/[0.03] border border-black/10'
                  }`}>
                    <span className={`material-symbols-outlined text-[13px] ${f.color}`}>check</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{f.title}</h4>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#64748B]'}`}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Screen Dashboard Grid */}
          <div className="lg:col-span-7 relative" style={{ perspective: '2000px' }}>
            <motion.div
              className={`relative rounded-2xl overflow-hidden border-4 backdrop-blur-xl ${
                isDark
                  ? 'border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]'
                  : 'border-[#E2DFE7] shadow-2xl'
              }`}
              initial={{ rotateY: -18, rotateX: 8, scale: 0.94, opacity: 0 }}
              whileInView={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-85px' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Chrome headers */}
              <div className={`h-10 w-full border-b flex items-center px-4 gap-2 ${
                isDark ? 'bg-[#0E0A22] border-white/[0.05]' : 'bg-[#F3F1F6] border-black/[0.05]'
              }`}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className={`mx-auto px-4 py-0.5 rounded text-[9px] tracking-wider font-mono font-bold ${
                  isDark ? 'bg-black/35 text-white/30' : 'bg-[#E3DDE9] text-[#494554]'
                }`}>
                  pulseiq.app/terminal
                </div>
              </div>

              {/* Inside Screen elements */}
              <div className={`p-5 min-h-[300px] flex flex-col gap-5 ${isDark ? 'bg-black/75' : 'bg-white/90'}`}>
                
                {/* Sentiment Gauge & Live Stats Columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left component: Live Sentiment Gauge */}
                  <div className="md:col-span-5">
                    <SentimentGauge isDark={isDark} />
                  </div>

                  {/* Right component: Heatmap Graph block */}
                  <div className={`md:col-span-7 flex flex-col justify-between p-5 rounded-xl border ${
                    isDark ? 'bg-black/35 border-white/5' : 'bg-white/50 border-[#E2DFE7]'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-bold font-headline">Anomaly Distribution</h3>
                        <p className={`text-[10px] ${isDark ? 'text-white/45' : 'text-[#64748B]'}`}>
                          Tracking <span className="text-neon-cyan font-bold">{streamCount.toLocaleString()}</span> metrics
                        </p>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        SYNCED
                      </div>
                    </div>

                    {/* Columns simulation */}
                    <div className={`h-28 rounded-lg border flex items-end p-2 gap-1.5 ${
                      isDark ? 'border-white/5 bg-black/40' : 'border-black/5 bg-[#FAF9FC]'
                    }`}>
                      {bars.map((h, i) => {
                        const isHigh = h > 75;
                        return (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${h}%`,
                              background: isHigh
                                ? 'linear-gradient(to top, #FF007F, #FFE500)'
                                : 'linear-gradient(to top, #00F2FE, #7928CA)',
                              transition: 'height 250ms ease',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Float alert bubble */}
            <motion.div
              className={`absolute -bottom-5 -left-4 sm:-left-6 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 border ${
                isDark ? 'bg-[#0E0A22] border-white/10' : 'bg-white border-[#E2DFE7]'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 rounded-lg bg-neon-pink/15 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-neon-pink text-[18px]">notifications_active</span>
              </div>
              <div>
                <div className="text-[8px] font-bold uppercase tracking-wider opacity-40">System Anomaly Alert</div>
                <div className="text-xs font-extrabold text-neon-yellow">Extreme Buy Signal Triggered</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           SECTION 5: FEATURES — BENTO SPOTLIGHTS
           ═══════════════════════════════════════════ */}
      <section id="features" className="relative z-10 w-full max-w-[1200px] px-6 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className={`text-[10px] uppercase tracking-[0.35em] font-bold font-mono ${isDark ? 'text-neon-cyan' : 'text-[#5A20B8]'}`}>
            Computational Fabric
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mt-3 mb-4 font-headline tracking-tight">
            High-Performance AI,{' '}
            <span className="text-gradient-colorful font-black">Infinite Scale.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <SpotlightCard
              key={f.title}
              isDark={isDark}
              className={isDark ? 'bg-white/[0.02] border-white/[0.05] shadow-2xl shadow-black/40' : 'bg-white/80 border-[#E2DFE7] shadow-xl'}
            >
              <div className="p-6 flex flex-col h-full justify-between">
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${f.gradient} text-white`}
                    style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                  >
                    <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 font-headline">
                    {f.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-[#64748B]'}`}>
                    {f.desc}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-neon-cyan cursor-pointer hover:gap-3 transition-all">
                  Inspect Spec
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 6: STATS SPINE TIMELINE (LASER TRAIL)
           ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1100px] px-6 py-16">
        <div className="relative">
          {/* Laser spine container */}
          <div className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 overflow-hidden rounded-full">
            <div className={`w-full h-full ${isDark ? 'bg-white/[0.04]' : 'bg-[#E2DFE7]'}`} />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-yellow"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 1.8 }}
              viewport={{ once: true }}
            />
            {/* Pulsing laser particle trail */}
            <div className="absolute top-0 w-36 h-full animate-laser" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 relative z-10">
            {stats.map((stat, i) => (
              <div key={stat.label} className="py-12 text-center flex flex-col items-center">
                <motion.div
                  className={`w-3.5 h-3.5 rounded-full mb-6 ${stat.dotColor} shadow-[0_0_15px_currentColor]`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  viewport={{ once: true }}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 + 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl sm:text-4xl font-extrabold font-headline mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
                  </div>
                  <div className={`text-[9px] font-mono uppercase tracking-[0.25em] ${isDark ? 'text-white/40' : 'text-[#64748B]'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 7: CTA HEXAGON SCANNER
           ═══════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-24 overflow-hidden">
        {/* Colorful backdrop mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#100826] to-[#05020C]">
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle, ${isDark ? '#00F2FE' : '#5A20B8'} 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }} />
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            className="mask-hexagon relative p-16 sm:p-20 md:p-28 bg-[#090518] border border-white/5 flex items-center justify-center overflow-hidden"
            initial={{ clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)' }}
            whileInView={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* Animated Scanning laser line */}
            <div className="absolute left-0 w-full h-[2.5px] animate-scanner pointer-events-none" />

            <div className="relative z-20">
              <span className="font-mono text-[9px] tracking-[0.35em] uppercase mb-6 block text-neon-cyan">
                SYSTEM CONSOLE REQUESTED
              </span>
              
              <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black mb-8 leading-tight text-white">
                Ready to stream<br />
                <span className="text-gradient-colorful">the future?</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <MagneticButton
                  href="/login/index.html"
                  className="btn-neon-pink px-8 py-4 rounded-full font-black text-base"
                >
                  Start Terminal Free
                </MagneticButton>
                
                <MagneticButton
                  href="#"
                  className="text-white/40 font-bold text-sm hover:text-white transition-colors"
                >
                  Contact Operations
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 w-full py-10 mt-auto">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 group">
            <div className={`h-[1px] w-6 bg-gradient-to-r from-transparent ${isDark ? 'to-white/10' : 'to-black/10'}`} />
            <p className={`text-[10px] uppercase tracking-[0.2em] font-semibold opacity-40`}>
              Designed & Developed by
            </p>
            <div className={`h-[1px] w-6 bg-gradient-to-l from-transparent ${isDark ? 'to-white/10' : 'to-black/10'}`} />
          </div>
          
          <a
            href="#"
            className="text-[14px] font-headline font-bold tracking-wide hover:text-neon-pink transition-all duration-300 relative group"
          >
            Rohit Maurya
            <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-gradient-to-r from-neon-cyan to-neon-pink group-hover:w-full transition-all duration-500" />
          </a>
          
          <p className={`text-[9px] tracking-wider opacity-30`}>
            © 2026 PulseIQ • All rights reserved
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
