import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import time
import json
from collections import Counter
import re

# --- CONFIGURATION ---
API_URL = "http://api:8000"
st.set_page_config(
    page_title="PulseIQ — AI News Intelligence", 
    layout="wide", 
    page_icon="⚡",
    initial_sidebar_state="expanded"
)

# =====================================================
# CUSTOM CSS + ANIMATIONS
# =====================================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    :root {
        --bg-primary: #0a0e1a;
        --bg-secondary: #111827;
        --bg-card: rgba(17, 24, 39, 0.7);
        --bg-glass: rgba(255, 255, 255, 0.03);
        --border-glass: rgba(255, 255, 255, 0.08);
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --text-muted: #64748b;
        --accent-cyan: #06b6d4;
        --accent-emerald: #10b981;
        --accent-violet: #8b5cf6;
        --accent-rose: #f43f5e;
        --accent-amber: #f59e0b;
        --accent-blue: #3b82f6;
        --glow-cyan: 0 0 20px rgba(6, 182, 212, 0.3);
        --glow-emerald: 0 0 20px rgba(16, 185, 129, 0.3);
        --glow-violet: 0 0 20px rgba(139, 92, 246, 0.3);
        --glow-rose: 0 0 20px rgba(244, 63, 94, 0.3);
    }

    .stApp { background: var(--bg-primary) !important; font-family: 'Inter', sans-serif !important; }
    .main .block-container { padding-top: 0.5rem !important; max-width: 1400px !important; }
    section[data-testid="stSidebar"] { background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%) !important; border-right: 1px solid var(--border-glass) !important; }
    section[data-testid="stSidebar"] .stMarkdown { color: var(--text-secondary) !important; }
    #MainMenu, footer, header { visibility: hidden; }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 5px rgba(6,182,212,0.2); } 50% { box-shadow: 0 0 25px rgba(6,182,212,0.5); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes ringPulse { 0%,100% { filter: drop-shadow(0 0 3px rgba(6,182,212,0.3)); } 50% { filter: drop-shadow(0 0 10px rgba(6,182,212,0.6)); } }
    @keyframes toastSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* ---- Ticker Bar ---- */
    .ticker-wrapper {
        background: linear-gradient(90deg, rgba(6,182,212,0.08), rgba(139,92,246,0.08), rgba(6,182,212,0.08));
        border: 1px solid var(--border-glass);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 1.2rem;
        position: relative;
        height: 42px;
        animation: fadeInUp 0.5s ease-out;
    }
    .ticker-label {
        position: absolute; left: 0; top: 0; bottom: 0; z-index: 2;
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        color: white; font-weight: 700; font-size: 0.72rem; letter-spacing: 1px;
        padding: 0 1rem; display: flex; align-items: center; text-transform: uppercase;
        border-radius: 12px 0 0 12px;
    }
    .ticker-track {
        display: flex; align-items: center; height: 100%;
        animation: tickerScroll 30s linear infinite;
        padding-left: 90px; white-space: nowrap;
    }
    .ticker-item {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 0 1.5rem; font-size: 0.8rem; color: var(--text-secondary);
        border-right: 1px solid var(--border-glass); height: 100%;
    }
    .ticker-item .pos { color: #10b981; font-weight: 600; }
    .ticker-item .neg { color: #f43f5e; font-weight: 600; }

    /* ---- Live Clock ---- */
    .live-clock {
        font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;
        color: var(--accent-cyan); background: rgba(6,182,212,0.08);
        border: 1px solid rgba(6,182,212,0.2); border-radius: 8px;
        padding: 0.3rem 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;
    }
    .live-clock .dot { animation: blink 1s ease-in-out infinite; color: #10b981; }

    /* ---- Hero ---- */
    .hero-header { text-align: center; padding: 1.5rem 0 0.8rem 0; animation: fadeInUp 0.8s ease-out; }
    .hero-header h1 {
        font-family: 'Inter', sans-serif; font-size: 3rem; font-weight: 900;
        background: linear-gradient(135deg, #06b6d4, #8b5cf6, #f43f5e);
        background-size: 200% 200%; -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 4s ease infinite; margin-bottom: 0.3rem; letter-spacing: -1px;
    }
    .hero-subtitle { font-size: 1.05rem; color: var(--text-secondary); font-weight: 400; letter-spacing: 0.5px; }
    .hero-badge-row { display: flex; justify-content: center; gap: 0.8rem; flex-wrap: wrap; margin-top: 1rem; }
    .hero-badge {
        display: inline-flex; align-items: center; gap: 0.4rem;
        background: var(--bg-glass); border: 1px solid var(--border-glass);
        border-radius: 100px; padding: 0.4rem 1rem; font-size: 0.78rem;
        color: var(--text-secondary); backdrop-filter: blur(10px); transition: all 0.3s ease;
    }
    .hero-badge:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); transform: translateY(-2px); }
    .hero-divider {
        width: 120px; height: 3px;
        background: linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-violet), transparent);
        border-radius: 2px; margin: 1rem auto 0 auto;
        animation: shimmer 3s ease infinite; background-size: 200% 100%;
    }

    /* ---- KPI Cards ---- */
    .kpi-card {
        background: var(--bg-card); border: 1px solid var(--border-glass);
        border-radius: 16px; padding: 1.3rem; backdrop-filter: blur(20px);
        transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        animation: fadeInUp 0.6s ease-out both; position: relative; overflow: hidden;
    }
    .kpi-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
    .kpi-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.15); }
    .kpi-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
    .kpi-card.emerald::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .kpi-card.rose::before { background: linear-gradient(90deg, #f43f5e, #fb7185); }
    .kpi-card.violet::before { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .kpi-card.amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .kpi-card:hover.cyan { box-shadow: var(--glow-cyan); }
    .kpi-card:hover.emerald { box-shadow: var(--glow-emerald); }
    .kpi-card:hover.rose { box-shadow: var(--glow-rose); }
    .kpi-card:hover.violet { box-shadow: var(--glow-violet); }
    .kpi-icon { font-size: 1.6rem; margin-bottom: 0.4rem; animation: float 3s ease-in-out infinite; }
    .kpi-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 0.2rem; }
    .kpi-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; animation: countUp 0.8s ease-out; }
    .kpi-value.cyan { color: var(--accent-cyan); } .kpi-value.emerald { color: var(--accent-emerald); }
    .kpi-value.rose { color: var(--accent-rose); } .kpi-value.violet { color: var(--accent-violet); }
    .kpi-value.amber { color: var(--accent-amber); }
    .kpi-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; }
    .kpi-delay-1 { animation-delay: 0.1s; } .kpi-delay-2 { animation-delay: 0.2s; }
    .kpi-delay-3 { animation-delay: 0.3s; } .kpi-delay-4 { animation-delay: 0.4s; }
    .kpi-delay-5 { animation-delay: 0.5s; }

    /* ---- Progress Ring in KPI ---- */
    .ring-container { display: flex; align-items: center; gap: 1rem; }
    .ring-svg { animation: ringPulse 3s ease-in-out infinite; }

    /* ---- Section Headers ---- */
    .section-header { display: flex; align-items: center; gap: 0.7rem; margin: 1.5rem 0 1rem 0; animation: fadeInLeft 0.6s ease-out; }
    .section-header h2 { font-family:'Inter',sans-serif; font-size:1.3rem; font-weight:700; color:var(--text-primary); margin:0; white-space: nowrap; }
    .section-header .section-line { flex:1; height:1px; background: linear-gradient(90deg, var(--border-glass), transparent); }

    /* ---- Glass Panel ---- */
    .glass-panel {
        background: var(--bg-card); border: 1px solid var(--border-glass);
        border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(20px);
        animation: fadeInUp 0.8s ease-out both; transition: border-color 0.3s ease;
    }
    .glass-panel:hover { border-color: rgba(255,255,255,0.12); }

    /* ---- News Feed ---- */
    .news-item {
        background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass);
        border-radius: 12px; padding: 0.9rem 1.1rem; margin-bottom: 0.6rem;
        transition: all 0.3s ease; animation: slideInFromBottom 0.5s ease-out both;
    }
    .news-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(6,182,212,0.3); transform: translateX(4px); }
    .news-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem; line-height: 1.4; }
    .news-meta { display: flex; align-items: center; gap: 0.7rem; font-size: 0.72rem; color: var(--text-muted); }
    .sentiment-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.15rem 0.6rem; border-radius: 100px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .sentiment-badge.positive { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .sentiment-badge.negative { background: rgba(244,63,94,0.15); color: #fb7185; border: 1px solid rgba(244,63,94,0.3); }
    .score-bar { width: 50px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
    .score-fill { height: 100%; border-radius: 2px; transition: width 1s ease-out; }
    .score-fill.positive { background: linear-gradient(90deg, #10b981, #34d399); }
    .score-fill.negative { background: linear-gradient(90deg, #f43f5e, #fb7185); }

    /* ---- Chat ---- */
    .chat-container { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(20px); animation: fadeInUp 0.8s ease-out; }
    .chat-message { padding: 1rem 1.2rem; border-radius: 12px; margin-bottom: 0.8rem; animation: slideInFromBottom 0.4s ease-out; line-height: 1.6; }
    .chat-user { background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15)); border: 1px solid rgba(59,130,246,0.2); color: var(--text-primary); margin-left: 2rem; }
    .chat-ai { background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); color: var(--text-secondary); margin-right: 2rem; }
    .chat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; }
    .chat-label.user { color: var(--accent-blue); } .chat-label.ai { color: var(--accent-cyan); }

    /* ---- Quick Prompt Chips ---- */
    .prompt-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .prompt-chip {
        background: rgba(255,255,255,0.04); border: 1px solid var(--border-glass);
        border-radius: 100px; padding: 0.4rem 1rem; font-size: 0.75rem;
        color: var(--text-secondary); cursor: pointer; transition: all 0.3s ease;
    }
    .prompt-chip:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); background: rgba(6,182,212,0.08); }

    /* ---- AI Summary Panel ---- */
    .ai-summary {
        background: linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.06));
        border: 1px solid rgba(6,182,212,0.15); border-radius: 16px;
        padding: 1.3rem; animation: fadeInUp 0.8s ease-out;
    }
    .ai-summary-title { font-size: 0.9rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.5rem; }
    .ai-summary-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7; }

    /* ---- Buttons ---- */
    .stButton > button { background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important; color: white !important; border: none !important; border-radius: 12px !important; padding: 0.7rem 2rem !important; font-weight: 600 !important; font-family: 'Inter',sans-serif !important; letter-spacing: 0.5px !important; transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; box-shadow: 0 4px 15px rgba(6,182,212,0.3) !important; }
    .stButton > button:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(6,182,212,0.5) !important; }
    .stDownloadButton > button { background: linear-gradient(135deg, #10b981, #059669) !important; color: white !important; border: none !important; border-radius: 12px !important; padding: 0.7rem 2rem !important; font-weight: 600 !important; transition: all 0.3s ease !important; box-shadow: 0 4px 15px rgba(16,185,129,0.3) !important; }
    .stDownloadButton > button:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(16,185,129,0.5) !important; }

    /* ---- Inputs ---- */
    .stTextInput > div > div > input { background: rgba(255,255,255,0.05) !important; border: 1px solid var(--border-glass) !important; border-radius: 12px !important; color: var(--text-primary) !important; font-family: 'Inter',sans-serif !important; padding: 0.8rem 1rem !important; transition: all 0.3s ease !important; }
    .stTextInput > div > div > input:focus { border-color: var(--accent-cyan) !important; box-shadow: 0 0 15px rgba(6,182,212,0.2) !important; }
    [data-testid="stMetric"] { background: transparent !important; }
    .stDataFrame { border-radius: 12px !important; overflow: hidden !important; }

    /* ---- Tabs ---- */
    .stTabs [data-baseweb="tab-list"] { gap: 0.5rem; background: transparent; }
    .stTabs [data-baseweb="tab"] { background: var(--bg-glass) !important; border: 1px solid var(--border-glass) !important; border-radius: 10px !important; color: var(--text-secondary) !important; font-family: 'Inter',sans-serif !important; font-weight: 500 !important; padding: 0.5rem 1.2rem !important; transition: all 0.3s ease !important; }
    .stTabs [aria-selected="true"] { background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2)) !important; border-color: var(--accent-cyan) !important; color: var(--text-primary) !important; }
    .stTabs [data-baseweb="tab-highlight"], .stTabs [data-baseweb="tab-border"] { display: none !important; }

    /* ---- Misc ---- */
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; animation: pulseGlow 2s ease-in-out infinite; }
    .status-dot.live { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.6); }
    .status-dot.offline { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.6); }
    .dashboard-footer { text-align: center; padding: 2rem 0 1rem 0; color: var(--text-muted); font-size: 0.75rem; animation: fadeInUp 1s ease-out; }
    .dashboard-footer a { color: var(--accent-cyan); text-decoration: none; }

    /* ---- Particle Canvas ---- */
    #particle-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
</style>
""", unsafe_allow_html=True)

# =====================================================
# ANIMATED PARTICLE BACKGROUND
# =====================================================
st.markdown("""
<canvas id="particle-canvas"></canvas>
<script>
(function() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 0.5, o: Math.random() * 0.3 + 0.05
        });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${p.o})`; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist/150)})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();
</script>
""", unsafe_allow_html=True)


# =====================================================
# HELPERS
# =====================================================
def render_kpi_card(icon, label, value, color="cyan", sub="", delay=1):
    st.markdown(f"""
    <div class="kpi-card {color} kpi-delay-{delay}">
        <div class="kpi-icon">{icon}</div>
        <div class="kpi-label">{label}</div>
        <div class="kpi-value {color}">{value}</div>
        <div class="kpi-sub">{sub}</div>
    </div>""", unsafe_allow_html=True)

def render_kpi_ring(icon, label, value, pct, color_hex, color_name, delay=1):
    """KPI card with animated SVG ring"""
    r = 30; circ = 2 * 3.14159 * r; offset = circ * (1 - pct / 100)
    st.markdown(f"""
    <div class="kpi-card {color_name} kpi-delay-{delay}">
        <div class="ring-container">
            <svg width="76" height="76" class="ring-svg">
                <circle cx="38" cy="38" r="{r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
                <circle cx="38" cy="38" r="{r}" fill="none" stroke="{color_hex}" stroke-width="5"
                    stroke-dasharray="{circ}" stroke-dashoffset="{offset}"
                    stroke-linecap="round" transform="rotate(-90 38 38)"
                    style="transition: stroke-dashoffset 1.5s ease-out;"/>
                <text x="38" y="42" text-anchor="middle" fill="{color_hex}"
                    font-size="13" font-weight="700" font-family="JetBrains Mono">{pct:.0f}%</text>
            </svg>
            <div>
                <div class="kpi-label">{label}</div>
                <div class="kpi-value {color_name}" style="font-size: 1.5rem;">{value}</div>
            </div>
        </div>
    </div>""", unsafe_allow_html=True)

def render_section_header(icon, title):
    st.markdown(f"""<div class="section-header"><h2>{icon} {title}</h2><div class="section-line"></div></div>""", unsafe_allow_html=True)

def render_news_item(title, source, sentiment, score, index):
    sent_class = "positive" if sentiment == "POSITIVE" else "negative"
    sent_icon = "▲" if sentiment == "POSITIVE" else "▼"
    score_pct = float(score) * 100 if score else 0
    delay_style = f"animation-delay: {index * 0.06}s;"
    st.markdown(f"""
    <div class="news-item" style="{delay_style}">
        <div class="news-title">{title}</div>
        <div class="news-meta">
            <span>📰 {source}</span>
            <span class="sentiment-badge {sent_class}">{sent_icon} {sentiment}</span>
            <div class="score-bar"><div class="score-fill {sent_class}" style="width: {score_pct}%"></div></div>
            <span>{score_pct:.1f}%</span>
        </div>
    </div>""", unsafe_allow_html=True)

def extract_keywords(df, top_n=20):
    """Extract trending keywords from article titles"""
    stop_words = {'the','a','an','is','are','was','were','in','on','at','to','for','of','and','or','but',
                  'with','by','from','as','it','its','this','that','these','those','be','been','being',
                  'have','has','had','do','does','did','will','would','could','should','may','might',
                  'shall','can','not','no','nor','so','very','just','than','too','also','into','over',
                  'after','before','between','under','about','up','out','off','down','then','here',
                  'there','when','where','how','what','which','who','whom','why','all','each','every',
                  'both','few','more','most','other','some','such','only','own','same','new','now',
                  'says','said','amid','s','t','re','ve','d','ll','don','isn','aren','wasn','weren',
                  'haven','hasn','hadn','won','wouldn','couldn','shouldn'}
    all_words = []
    for title in df['title'].dropna():
        words = re.findall(r'[a-zA-Z]{3,}', title.lower())
        all_words.extend([w for w in words if w not in stop_words])
    return Counter(all_words).most_common(top_n)


# =====================================================
# DATA FETCHING
# =====================================================
@st.cache_data(ttl=300)
def fetch_articles(limit=100):
    try:
        response = requests.get(f"{API_URL}/articles?limit={limit}", timeout=5)
        if response.status_code == 200:
            df = pd.DataFrame(response.json()["articles"])
            if df.empty:
                st.cache_data.clear()
            return df
        st.cache_data.clear()
        return pd.DataFrame()
    except Exception:
        st.cache_data.clear()
        return pd.DataFrame()

def fetch_articles_with_retry(limit=100, max_retries=6, delay=5):
    """Try fetching articles, retry if API is still starting up."""
    for attempt in range(max_retries):
        df = fetch_articles(limit)
        if not df.empty:
            return df
        if attempt < max_retries - 1:
            time.sleep(delay)
            st.cache_data.clear()
    return pd.DataFrame()


# =====================================================
# SIDEBAR
# =====================================================
with st.sidebar:
    st.markdown("""
    <div style="text-align:center; padding: 1rem 0;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚡</div>
        <div style="font-size: 1.3rem; font-weight: 800; 
             background: linear-gradient(135deg, #06b6d4, #8b5cf6);
             -webkit-background-clip: text; -webkit-text-fill-color: transparent;
             letter-spacing: -0.5px;">PulseIQ</div>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 0.3rem; letter-spacing: 2px; text-transform: uppercase;">
            Intelligence Platform
        </div>
    </div>""", unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Live status
    try:
        health = requests.get(f"{API_URL}/", timeout=2)
        if health.status_code == 200:
            st.markdown('<div><span class="status-dot live"></span> <span style="color: #10b981; font-weight: 600; font-size: 0.85rem;">System Online</span></div>', unsafe_allow_html=True)
        else:
            st.markdown('<div><span class="status-dot offline"></span> <span style="color: #ef4444; font-weight: 600; font-size: 0.85rem;">System Offline</span></div>', unsafe_allow_html=True)
    except Exception:
        st.markdown('<div><span class="status-dot offline"></span> <span style="color: #ef4444; font-weight: 600; font-size: 0.85rem;">System Offline</span></div>', unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("##### ⚙️ Settings")
    auto_refresh = st.toggle("Auto Refresh (10s)", value=False)
    if st.button("🔄 Refresh Now", use_container_width=True):
        st.cache_data.clear()
        st.rerun()
    article_limit = st.slider("Articles to fetch", 10, 200, 100, step=10)
    
    st.markdown("---")
    
    # Quick Actions
    st.markdown("##### ⚡ Quick Actions")
    trigger_cluster = st.button("🔬 Run Topic Clustering", use_container_width=True, key="sidebar_cluster")
    if trigger_cluster:
        try:
            r = requests.post(f"{API_URL}/cluster", timeout=15)
            if r.status_code == 200:
                st.success(r.json().get("message", "Done!"))
            else:
                st.error("Clustering failed")
        except:
            st.error("Cannot reach backend")
    
    st.markdown("---")    
    st.markdown("""
    <div style="background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); 
                border-radius: 12px; padding: 1rem; font-size: 0.78rem; color: #94a3b8;">
        <div style="font-weight: 700; color: #06b6d4; margin-bottom: 0.5rem;">🧠 Powered By</div>
        <div style="margin-bottom: 0.3rem;">• Apache Kafka — Streaming</div>
        <div style="margin-bottom: 0.3rem;">• PostgreSQL — Storage</div>
        <div style="margin-bottom: 0.3rem;">• ChromaDB — Vectors</div>
        <div style="margin-bottom: 0.3rem;">• Gemini AI — Intelligence</div>
        <div>• FastAPI — Backend</div>
    </div>""", unsafe_allow_html=True)
    
    st.markdown("---")
    current_time = datetime.now().strftime("%I:%M:%S %p")
    st.markdown(f'<div style="text-align: center; font-size: 0.75rem; color: #64748b;">🕐 Last refreshed: {current_time}</div>', unsafe_allow_html=True)


# =====================================================
# MAIN
# =====================================================
# Use retry logic on first load to wait for API startup
if 'initial_load_done' not in st.session_state:
    with st.spinner("⏳ Connecting to PulseIQ Backend... Please wait while services start up."):
        df = fetch_articles_with_retry(limit=article_limit, max_retries=6, delay=5)
    st.session_state.initial_load_done = True
else:
    df = fetch_articles(limit=article_limit)

# ── Ticker Bar (Bloomberg-style scrolling news) ──
if not df.empty:
    ticker_items = ""
    for _, row in df.head(20).iterrows():
        sent = row.get('sentiment', 'UNKNOWN')
        cls = "pos" if sent == "POSITIVE" else "neg"
        icon = "▲" if sent == "POSITIVE" else "▼"
        short_title = str(row.get('title', ''))[:55]
        ticker_items += f'<span class="ticker-item"><span class="{cls}">{icon}</span> {short_title}</span>'
    
    st.markdown(f"""
    <div class="ticker-wrapper">
        <div class="ticker-label">⚡ LIVE</div>
        <div class="ticker-track">{ticker_items}{ticker_items}</div>
    </div>""", unsafe_allow_html=True)

# ── Hero Header + Live Clock ──
now = datetime.now()
st.markdown(f"""
<div class="hero-header">
    <h1>PulseIQ</h1>
    <div class="hero-subtitle">Real-Time AI News Intelligence Dashboard</div>
    <div style="margin-top: 0.8rem;">
        <span class="live-clock"><span class="dot">●</span> LIVE — {now.strftime("%A, %B %d %Y  •  %I:%M:%S %p")}</span>
    </div>
    <div class="hero-badge-row">
        <span class="hero-badge">⚡ Live Streaming</span>
        <span class="hero-badge">🧠 AI Powered</span>
        <span class="hero-badge">📊 Sentiment Analysis</span>
        <span class="hero-badge">💬 RAG Chatbot</span>
        <span class="hero-badge">🔍 Vector Search</span>
        <span class="hero-badge">🔬 Topic Clustering</span>
    </div>
    <div class="hero-divider"></div>
</div>""", unsafe_allow_html=True)


if df.empty:
    st.markdown("""
    <div style="text-align: center; padding: 4rem 2rem; animation: fadeInUp 0.8s ease-out;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔌</div>
        <h3 style="color: #f1f5f9; font-family: 'Inter', sans-serif; font-weight: 700;">Cannot Connect to PulseIQ Backend</h3>
        <p style="color: #64748b; max-width: 500px; margin: 0.5rem auto;">
            Make sure your FastAPI server is running with <code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.6rem; border-radius: 6px; color: #06b6d4;">uvicorn api:app --reload</code>
        </p>
    </div>""", unsafe_allow_html=True)
else:
    # ── Calculate Metrics ──
    total_articles = len(df)
    positive_count = len(df[df['sentiment'] == 'POSITIVE'])
    negative_count = len(df[df['sentiment'] == 'NEGATIVE'])
    pos_pct = (positive_count / total_articles * 100) if total_articles > 0 else 0
    neg_pct = (negative_count / total_articles * 100) if total_articles > 0 else 0
    avg_score = df['score'].mean() * 100 if 'score' in df.columns else 0
    unique_sources = df['source'].nunique() if 'source' in df.columns else 0
    
    if pos_pct > 60: mood = "🟢 Bullish"
    elif neg_pct > 60: mood = "🔴 Bearish"
    else: mood = "🟡 Neutral"

    # ── KPI Row with Progress Rings ──
    render_section_header("📊", "Live System Metrics")
    k1, k2, k3, k4, k5 = st.columns(5)
    
    with k1:
        render_kpi_card("📰", "Articles Analyzed", str(total_articles), "cyan", "Real-time pipeline", 1)
    with k2:
        render_kpi_ring("📈", "Positive", f"{positive_count} articles", pos_pct, "#10b981", "emerald", 2)
    with k3:
        render_kpi_ring("📉", "Negative", f"{negative_count} articles", neg_pct, "#f43f5e", "rose", 3)
    with k4:
        render_kpi_ring("🎯", "Confidence", "Model Certainty", avg_score, "#8b5cf6", "violet", 4)
    with k5:
        render_kpi_card("🌐", "Market Mood", mood, "amber", f"{unique_sources} sources", 5)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── AI Quick Summary ──
    render_section_header("🧠", "AI Quick Summary")
    
    # Generate a dynamic summary from the data
    top_source = df['source'].mode().iloc[0] if not df['source'].mode().empty else "Unknown"
    high_conf = df[df['score'] > 0.95] if 'score' in df.columns else pd.DataFrame()
    high_conf_count = len(high_conf)
    
    summary_lines = []
    summary_lines.append(f"📡 <strong>{total_articles}</strong> articles analyzed from <strong>{unique_sources}</strong> sources")
    if pos_pct > neg_pct:
        summary_lines.append(f"📈 Market is leaning <strong style='color:#10b981;'>positive ({pos_pct:.0f}%)</strong> — sentiment favors optimism")
    else:
        summary_lines.append(f"📉 Market is leaning <strong style='color:#f43f5e;'>negative ({neg_pct:.0f}%)</strong> — sentiment shows caution")
    summary_lines.append(f"📰 Top source: <strong>{top_source}</strong> | {high_conf_count} articles with >95% AI confidence")
    
    top_keywords = extract_keywords(df, 5)
    if top_keywords:
        kw_str = ", ".join([f"<strong>{w}</strong>" for w, _ in top_keywords])
        summary_lines.append(f"🔥 Trending topics: {kw_str}")
    
    st.markdown(f"""
    <div class="ai-summary">
        <div class="ai-summary-title">🧠 Intelligence Briefing — {now.strftime("%B %d, %Y")}</div>
        <div class="ai-summary-text">
            {"<br>".join(summary_lines)}
        </div>
    </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Charts Section ──
    render_section_header("📈", "Sentiment Analysis")
    
    chart_tabs = st.tabs(["🍩 Distribution", "📊 By Source", "📉 Confidence", "🔥 Heatmap", "🗺️ Trending Keywords", "📡 Source Radar"])
    
    plotly_layout = dict(
        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
        font=dict(family="Inter", color="#94a3b8"),
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(bgcolor='rgba(0,0,0,0)', font=dict(color='#94a3b8', size=11))
    )
    
    with chart_tabs[0]:
        c1, c2 = st.columns(2)
        with c1:
            sentiment_counts = df['sentiment'].value_counts()
            color_map = {'POSITIVE': '#10b981', 'NEGATIVE': '#f43f5e'}
            colors = [color_map.get(s, '#64748b') for s in sentiment_counts.index]
            fig_donut = go.Figure(data=[go.Pie(
                labels=sentiment_counts.index, values=sentiment_counts.values, hole=0.55,
                marker=dict(colors=colors, line=dict(color='#0a0e1a', width=3)),
                textfont=dict(size=13, family='Inter'), textinfo='label+percent',
                hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Share: %{percent}<extra></extra>'
            )])
            fig_donut.update_layout(**plotly_layout, title=dict(text="Sentiment Split", font=dict(size=16, color='#f1f5f9')),
                height=380, showlegend=False,
                annotations=[dict(text=f"<b>{total_articles}</b><br>Total", x=0.5, y=0.5, font_size=18, showarrow=False, font=dict(color='#f1f5f9', family='JetBrains Mono'))])
            st.plotly_chart(fig_donut, use_container_width=True)
        with c2:
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number+delta", value=pos_pct,
                number=dict(suffix="%", font=dict(size=40, color="#f1f5f9", family="JetBrains Mono")),
                delta=dict(reference=50, increasing=dict(color="#10b981"), decreasing=dict(color="#f43f5e")),
                title=dict(text="Positive Ratio", font=dict(size=16, color="#f1f5f9")),
                gauge=dict(axis=dict(range=[0, 100], tickcolor="#64748b"), bar=dict(color="#06b6d4"),
                    bgcolor="rgba(255,255,255,0.05)", bordercolor="rgba(255,255,255,0.1)",
                    steps=[dict(range=[0,30], color="rgba(244,63,94,0.15)"), dict(range=[30,70], color="rgba(245,158,11,0.15)"), dict(range=[70,100], color="rgba(16,185,129,0.15)")],
                    threshold=dict(line=dict(color="#f43f5e", width=3), value=neg_pct))
            ))
            fig_gauge.update_layout(**plotly_layout, height=380)
            st.plotly_chart(fig_gauge, use_container_width=True)

    with chart_tabs[1]:
        if 'source' in df.columns:
            source_sentiment = df.groupby(['source', 'sentiment']).size().reset_index(name='count')
            fig_source = px.bar(source_sentiment, x='source', y='count', color='sentiment',
                barmode='group', color_discrete_map={'POSITIVE': '#10b981', 'NEGATIVE': '#f43f5e'},
                labels={'count': 'Articles', 'source': 'News Source', 'sentiment': 'Sentiment'})
            fig_source.update_layout(**plotly_layout, title=dict(text="Sentiment Breakdown by Source", font=dict(size=16, color='#f1f5f9')),
                height=420, xaxis=dict(gridcolor='rgba(255,255,255,0.05)', tickangle=-45), yaxis=dict(gridcolor='rgba(255,255,255,0.05)'))
            fig_source.update_traces(marker_line_width=0, opacity=0.9)
            st.plotly_chart(fig_source, use_container_width=True)

    with chart_tabs[2]:
        if 'score' in df.columns:
            fig_hist = go.Figure()
            fig_hist.add_trace(go.Histogram(x=df[df['sentiment']=='POSITIVE']['score'], name='Positive', nbinsx=20, marker=dict(color='rgba(16,185,129,0.6)', line=dict(color='#10b981', width=1)), opacity=0.8))
            fig_hist.add_trace(go.Histogram(x=df[df['sentiment']=='NEGATIVE']['score'], name='Negative', nbinsx=20, marker=dict(color='rgba(244,63,94,0.6)', line=dict(color='#f43f5e', width=1)), opacity=0.8))
            fig_hist.update_layout(**plotly_layout, title=dict(text="Confidence Score Distribution", font=dict(size=16, color='#f1f5f9')),
                height=420, barmode='overlay', xaxis=dict(title="Confidence Score", gridcolor='rgba(255,255,255,0.05)'), yaxis=dict(title="Count", gridcolor='rgba(255,255,255,0.05)'))
            st.plotly_chart(fig_hist, use_container_width=True)

    with chart_tabs[3]:
        if 'source' in df.columns:
            pivot = df.groupby(['source', 'sentiment']).size().unstack(fill_value=0)
            fig_heatmap = go.Figure(data=go.Heatmap(
                z=pivot.values, x=pivot.columns.tolist(), y=pivot.index.tolist(),
                colorscale=[[0, '#0a0e1a'], [0.5, '#06b6d4'], [1, '#8b5cf6']],
                hovertemplate='Source: %{y}<br>Sentiment: %{x}<br>Count: %{z}<extra></extra>',
                texttemplate="%{z}", textfont=dict(size=14, color='#f1f5f9')))
            fig_heatmap.update_layout(**plotly_layout, title=dict(text="Source × Sentiment Heatmap", font=dict(size=16, color='#f1f5f9')), height=420, xaxis=dict(side='top'))
            st.plotly_chart(fig_heatmap, use_container_width=True)

    # ── NEW: Trending Keywords Treemap ──
    with chart_tabs[4]:
        keywords = extract_keywords(df, 25)
        if keywords:
            kw_labels = [w for w, _ in keywords]
            kw_values = [c for _, c in keywords]
            colors_kw = [f"rgba(6,182,212,{0.3 + 0.7*(c/max(kw_values))})" for c in kw_values]
            fig_tree = go.Figure(go.Treemap(
                labels=kw_labels, parents=[""]*len(kw_labels), values=kw_values,
                marker=dict(colors=colors_kw, line=dict(color='#0a0e1a', width=2)),
                textfont=dict(family='Inter', size=14), textinfo='label+value',
                hovertemplate='<b>%{label}</b><br>Mentions: %{value}<extra></extra>'
            ))
            fig_tree.update_layout(**plotly_layout, title=dict(text="🗺️ Trending Keywords from Headlines", font=dict(size=16, color='#f1f5f9')), height=450)
            st.plotly_chart(fig_tree, use_container_width=True)
        else:
            st.info("Not enough data for keyword analysis")

    # ── NEW: Source Radar Chart ──
    with chart_tabs[5]:
        if 'source' in df.columns:
            source_counts = df['source'].value_counts().head(8)
            fig_radar = go.Figure()
            fig_radar.add_trace(go.Scatterpolar(
                r=source_counts.values.tolist() + [source_counts.values[0]],
                theta=source_counts.index.tolist() + [source_counts.index[0]],
                fill='toself', fillcolor='rgba(6,182,212,0.15)',
                line=dict(color='#06b6d4', width=2),
                marker=dict(size=6, color='#06b6d4'),
                name='Articles', hovertemplate='%{theta}: %{r} articles<extra></extra>'
            ))
            fig_radar.update_layout(**plotly_layout,
                title=dict(text="📡 Source Coverage Radar", font=dict(size=16, color='#f1f5f9')),
                height=450, polar=dict(
                    bgcolor='rgba(0,0,0,0)',
                    radialaxis=dict(visible=True, gridcolor='rgba(255,255,255,0.05)', tickfont=dict(color='#64748b')),
                    angularaxis=dict(gridcolor='rgba(255,255,255,0.08)', tickfont=dict(color='#94a3b8', size=11))
                ), showlegend=False)
            st.plotly_chart(fig_radar, use_container_width=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── News Feed & Data Table ──
    render_section_header("📰", "Live News Intelligence Feed")
    feed_col, data_col = st.columns([1, 1])
    
    with feed_col:
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.markdown(f"""<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-weight: 700; color: #f1f5f9; font-size: 1rem;">Latest Headlines</span>
            <span style="font-size: 0.75rem; color: #64748b;">{total_articles} articles</span>
        </div>""", unsafe_allow_html=True)
        
        for i in range(min(12, total_articles)):
            row = df.iloc[i]
            render_news_item(row.get('title', 'Untitled'), row.get('source', 'Unknown'), row.get('sentiment', 'UNKNOWN'), row.get('score', 0), i)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with data_col:
        st.markdown('<div class="glass-panel">', unsafe_allow_html=True)
        st.markdown("""<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span style="font-weight: 700; color: #f1f5f9; font-size: 1rem;">📋 Raw Data Table</span></div>""", unsafe_allow_html=True)
        display_df = df[['title', 'source', 'sentiment', 'score']].copy()
        display_df.columns = ['📄 Title', '📰 Source', '🎭 Sentiment', '📊 Score']
        st.dataframe(display_df, height=480, use_container_width=True, hide_index=True)
        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(label="📊 Export to CSV / Power BI", data=csv, file_name='pulseiq_intelligence_report.csv', mime='text/csv', use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── AI Chatbot Section ──
    render_section_header("🤖", "PulseIQ AI Brain — Ask Anything")
    
    st.markdown("""<div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.8rem; animation: fadeInUp 0.6s ease-out;">
        Ask questions about the latest news. PulseIQ uses <strong style="color: #06b6d4;">Semantic Vector Search</strong> 
        + <strong style="color: #8b5cf6;">Gemini AI</strong> to find and analyze relevant articles in real-time.
    </div>""", unsafe_allow_html=True)
    
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    
    # Quick Prompt Chips
    st.markdown("**💡 Quick prompts:**")
    chip_cols = st.columns(4)
    prompts = [
        "What's the overall market sentiment?",
        "Summarize today's top news",
        "Which sources are most negative?",
        "What are the trending topics?"
    ]
    selected_prompt = None
    for i, prompt in enumerate(prompts):
        with chip_cols[i]:
            if st.button(prompt, key=f"chip_{i}", use_container_width=True):
                selected_prompt = prompt
    
    # Chat input
    chat_col1, chat_col2 = st.columns([5, 1])
    with chat_col1:
        user_question = st.text_input("Ask PulseIQ about today's news...", 
            placeholder="e.g. What are the most positive tech news today?",
            label_visibility="collapsed", value=selected_prompt if selected_prompt else "")
    with chat_col2:
        ask_clicked = st.button("⚡ Ask AI", use_container_width=True, key="main_ask")
    
    if (ask_clicked or selected_prompt) and user_question:
        st.session_state.chat_history.append({"role": "user", "content": user_question})
        with st.spinner("🔍 Searching vectors & analyzing with Gemini..."):
            try:
                res = requests.post(f"{API_URL}/query", json={"question": user_question}, timeout=30)
                if res.status_code == 200:
                    st.session_state.chat_history.append({"role": "ai", "content": res.json()["answer"]})
                else:
                    st.session_state.chat_history.append({"role": "ai", "content": f"❌ Backend Error: {res.text}"})
            except:
                st.session_state.chat_history.append({"role": "ai", "content": "❌ Failed to reach the AI Brain. Is FastAPI running?"})
        st.rerun()
    elif ask_clicked and not user_question:
        st.warning("💡 Please type a question first!")
    
    # Render chat history
    if st.session_state.chat_history:
        st.markdown('<div class="chat-container">', unsafe_allow_html=True)
        for msg in st.session_state.chat_history:
            if msg["role"] == "user":
                st.markdown(f'<div class="chat-message chat-user"><div class="chat-label user">🧑 You</div>{msg["content"]}</div>', unsafe_allow_html=True)
            else:
                st.markdown(f'<div class="chat-message chat-ai"><div class="chat-label ai">🤖 PulseIQ AI</div>{msg["content"]}</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        if st.button("🗑️ Clear Chat", key="clear_chat"):
            st.session_state.chat_history = []
            st.rerun()
    else:
        st.markdown("""<div class="chat-container" style="text-align: center; padding: 2.5rem;">
            <div style="font-size: 3rem; margin-bottom: 0.8rem; opacity: 0.5;">💬</div>
            <div style="color: #64748b; font-size: 0.9rem;">Start a conversation with PulseIQ AI<br>
                <span style="font-size: 0.78rem; color: #475569;">Use the quick prompts above or type your own question</span>
            </div></div>""", unsafe_allow_html=True)


# ── Footer ──
st.markdown("""
<div class="dashboard-footer">
    <div style="margin-bottom: 0.3rem;">
        Built with ⚡ by <strong style="color: #06b6d4;">PulseIQ</strong> — Real-Time AI News Intelligence
    </div>
    <div>Kafka • PostgreSQL • ChromaDB • Gemini • FastAPI • Streamlit</div>
</div>""", unsafe_allow_html=True)

# ── Auto Refresh ──
if 'auto_refresh' in dir() and auto_refresh:
    time.sleep(10)
    st.rerun()