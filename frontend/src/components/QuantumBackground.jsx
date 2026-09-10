import { useEffect, useRef } from 'react';

export default function QuantumBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 170
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle nodes definition
    const particleCount = Math.min(75, Math.floor((width * height) / 18000));
    const particles = [];
    const colors = ['#00F2FE', '#A370FF', '#FF007F', '#10B981', '#FFE500'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 2.2 + 1.0,
        baseColor: colors[i % colors.length],
        alpha: Math.random() * 0.45 + 0.35
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce from walls
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse magnetic reaction
        const dxMouse = mouse.x - p1.x;
        const dyMouse = mouse.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius) {
          const force = (1 - distMouse / mouse.radius) * 0.85;
          p1.x += (dxMouse / distMouse) * force * 1.8;
          p1.y += (dyMouse / distMouse) * force * 1.8;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.baseColor;
        ctx.globalAlpha = distMouse < mouse.radius ? 0.95 : p1.alpha;
        ctx.shadowBlur = distMouse < mouse.radius ? 16 : 6;
        ctx.shadowColor = p1.baseColor;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 140) * 0.25;
            ctx.strokeStyle = p1.baseColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="quantum-background">
      {/* Dynamic Vibrant Neon Ambient Aurora Glow Orbs */}
      <div className="absolute top-[-10%] left-[10%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-cyan-500/18 via-violet-600/14 to-transparent blur-[140px] animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-[-10%] right-[5%] w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-fuchsia-600/18 via-purple-700/14 to-transparent blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[35%] right-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-emerald-500/12 via-teal-500/10 to-transparent blur-[130px] animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute bottom-[20%] left-[20%] w-[420px] h-[420px] rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/8 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '11s' }} />

      {/* Cyber Grid Matrix Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 242, 254, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Interactive Physics Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
