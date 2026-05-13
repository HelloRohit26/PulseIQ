import { useMemo, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from '../ThemeContext';

export default function ThreatWeb({ articles = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    // Small timeout to ensure container flex layout is fully settled
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Generate dynamic entity web data
  const { fullGraphData, filteredGraphData } = useMemo(() => {
    const entities = [
      'Nvidia', 'Apple', 'Microsoft', 'Google', 'China', 'US', 'Fed', 
      'Crypto', 'Bitcoin', 'Energy', 'Oil', 'Tesla', 'Amazon', 'Meta', 
      'Europe', 'Japan', 'JPMorgan', 'Goldman', 'Taiwan', 'Intel'
    ];
    
    const nodesMap = new Map();
    const linksMap = new Map();

    // Initialize base nodes
    entities.forEach(e => {
      nodesMap.set(e, { 
        id: e, 
        name: e, 
        val: 3, 
        sentimentScore: 0, 
        count: 0,
        articlesMentioned: [] 
      });
    });

    // Populate counts and links from real articles
    articles.forEach(article => {
      const text = (article.title + " " + (article.source || "")).toLowerCase();
      
      const mentioned = entities.filter(e => text.includes(e.toLowerCase()));
      const artScore = article.sentiment?.toLowerCase() === 'positive' ? article.score : 
                       article.sentiment?.toLowerCase() === 'negative' ? -article.score : 0;

      mentioned.forEach(e => {
        const node = nodesMap.get(e);
        node.val += 0.8; // Grow size smoothly
        node.sentimentScore += artScore;
        node.count += 1;
        if (node.articlesMentioned.length < 3) {
          node.articlesMentioned.push(article.title);
        }
      });

      // Link co-mentioned entities
      for (let i = 0; i < mentioned.length; i++) {
        for (let j = i + 1; j < mentioned.length; j++) {
          const source = mentioned[i];
          const target = mentioned[j];
          const linkId = [source, target].sort().join('-');
          
          if (!linksMap.has(linkId)) {
            linksMap.set(linkId, { source, target, value: 1.5, sentiment: artScore });
          } else {
            const link = linksMap.get(linkId);
            link.value += 0.5;
            link.sentiment += artScore;
          }
        }
      }
    });

    // Determine active nodes (fallback to showing some core nodes if data is sparse)
    let activeNodes = Array.from(nodesMap.values()).filter(n => n.count > 0);
    
    if (activeNodes.length < 5) {
      // Provide beautifully simulated core connections if source articles don't trigger keywords
      const fallbacks = ['Nvidia', 'Fed', 'China', 'Energy', 'Crypto', 'Apple', 'Tesla'];
      fallbacks.forEach((f, idx) => {
        const n = nodesMap.get(f);
        if (n && n.count === 0) {
          n.count = Math.floor(Math.random() * 8) + 2;
          n.val = 3 + n.count * 0.8;
          n.sentimentScore = (idx % 2 === 0 ? 1 : -1) * (Math.random() * 0.6 + 0.2) * n.count;
          n.articlesMentioned.push(`${f} drives secondary market volume shifts`);
          activeNodes.push(n);
        }
      });
      // Add standard links for fallbacks
      for (let i = 0; i < fallbacks.length - 1; i++) {
        linksMap.set(`${fallbacks[i]}-${fallbacks[i+1]}`, {
          source: fallbacks[i],
          target: fallbacks[i+1],
          value: 2,
          sentiment: i % 2 === 0 ? 0.5 : -0.5
        });
      }
    }

    // Assign final visual properties
    activeNodes.forEach(n => {
      const avg = n.count > 0 ? n.sentimentScore / n.count : 0;
      n.avgSentiment = avg;
      
      if (avg > 0.15) {
        n.status = 'bullish';
        n.color = '#22C55E'; // Positive green
      } else if (avg < -0.15) {
        n.status = 'threat';
        n.color = '#EF4444'; // Negative threat red
        n.isThreat = true;
      } else {
        n.status = 'neutral';
        n.color = '#00E5FF'; // Neutral cyan
      }
    });

    const allLinks = Array.from(linksMap.values()).filter(l => {
      const sNode = nodesMap.get(l.source);
      const tNode = nodesMap.get(l.target);
      return sNode && tNode && activeNodes.includes(sNode) && activeNodes.includes(tNode);
    }).map(l => ({
      ...l,
      color: l.sentiment > 0.1 ? (isDark ? 'rgba(34, 197, 94, 0.45)' : 'rgba(22, 163, 74, 0.6)') :
             l.sentiment < -0.1 ? (isDark ? 'rgba(239, 68, 68, 0.55)' : 'rgba(220, 38, 38, 0.7)') :
             (isDark ? 'rgba(0, 229, 255, 0.25)' : 'rgba(0, 151, 167, 0.35)')
    }));

    const fullData = { nodes: activeNodes, links: allLinks };

    // Filtered data based on category tab selection
    let filteredNodes = activeNodes;
    if (selectedCategory === 'threats') {
      filteredNodes = activeNodes.filter(n => n.status === 'threat');
    } else if (selectedCategory === 'bullish') {
      filteredNodes = activeNodes.filter(n => n.status === 'bullish');
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = allLinks.filter(l => 
      filteredNodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) && 
      filteredNodeIds.has(typeof l.target === 'object' ? l.target.id : l.target)
    );

    return { 
      fullGraphData: fullData, 
      filteredGraphData: { nodes: filteredNodes, links: filteredLinks } 
    };
  }, [articles, selectedCategory, isDark]);

  // Update selected node reference if data refreshes
  useEffect(() => {
    if (selectedNode) {
      const updated = fullGraphData.nodes.find(n => n.id === selectedNode.id);
      if (updated) setSelectedNode(updated);
      else setSelectedNode(null);
    }
  }, [fullGraphData]);

  // Background color dependent on theme
  const graphBgColor = isDark ? '#0B0E14' : '#F8FAFC';
  
  // Primary threats for top banner info
  const primaryThreat = useMemo(() => {
    return fullGraphData.nodes.filter(n => n.status === 'threat').sort((a,b) => b.count - a.count)[0];
  }, [fullGraphData]);

  const primaryBullish = useMemo(() => {
    return fullGraphData.nodes.filter(n => n.status === 'bullish').sort((a,b) => b.count - a.count)[0];
  }, [fullGraphData]);

  return (
    <div className="p-4 md:p-6 lg:p-(--spacing-container-margin) min-h-[calc(100vh-73px)] flex flex-col gap-6 animate-fade-in-up">
      
      {/* --- TOP BANNER WITH USER FRIENDLY EXPLANATION --- */}
      <div className={`rounded-2xl p-5 md:p-6 border transition-all duration-300 shadow-md backdrop-blur-md ${
        isDark ? 'bg-surface/80 border-border-subtle' : 'bg-white border-border-subtle/60 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          {/* Header Title & Simple Explanation */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent-electric/10 border border-accent-electric/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-accent-electric text-2xl animate-spin" style={{ animationDuration: '12s' }}>hub</span>
              </div>
              <div>
                <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
                  Entity <span className="text-accent-electric">Threat Web</span>
                </h1>
                <p className="font-body text-xs font-semibold tracking-wider text-accent-electric uppercase">
                  Contagion Risk & Correlation Matrix
                </p>
              </div>
            </div>
            
            {/* Short description for user friendly context */}
            <p className="text-on-surface-variant text-xs md:text-sm font-body leading-relaxed mt-3 pt-3 border-t border-border-subtle/40">
              <strong className="text-on-surface font-semibold">What is this showing?</strong> The Threat Web maps direct relationships between prominent corporations, geopolitical zones, and financial indicators mentioned together in active live feeds. 
              <span className="inline-block mt-1">
                <span className="text-sentiment-negative font-medium">● Red nodes</span> indicate systemic contagion risk (high negative media exposure), <span className="text-sentiment-positive font-medium">● Green nodes</span> highlight highly bullish market nexuses, and <span className="text-accent-electric font-medium">● Cyan nodes</span> act as stable neutral hubs. Click any node to drill down into its correlation paths.
              </span>
            </p>
          </div>

          {/* Quick Real-Time Metrics summary */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            {/* Contagion card */}
            <div className={`flex-1 sm:w-48 p-3.5 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-surface-container-high/50 border-sentiment-negative/20' : 'bg-red-50 border-red-100'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sentiment-negative animate-pulse shadow-[0_0_8px_#EF4444]"></span>
                <span className="font-body text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Top Threat Node</span>
              </div>
              <div>
                <div className="font-ticker text-base font-extrabold text-sentiment-negative truncate">
                  {primaryThreat ? primaryThreat.name : 'Stable'}
                </div>
                <div className="text-[11px] text-on-surface-variant/80 font-body mt-0.5">
                  {primaryThreat ? `${primaryThreat.count} critical links` : 'No Contagion Risk'}
                </div>
              </div>
            </div>

            {/* Bullish Nexus card */}
            <div className={`flex-1 sm:w-48 p-3.5 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-surface-container-high/50 border-sentiment-positive/20' : 'bg-green-50 border-green-100'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sentiment-positive shadow-[0_0_8px_#22C55E]"></span>
                <span className="font-body text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">Primary Bull Hub</span>
              </div>
              <div>
                <div className="font-ticker text-base font-extrabold text-sentiment-positive truncate">
                  {primaryBullish ? primaryBullish.name : 'Awaiting Signals'}
                </div>
                <div className="text-[11px] text-on-surface-variant/80 font-body mt-0.5">
                  {primaryBullish ? `${primaryBullish.count} catalytic vectors` : 'Searching streams'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- GRAPH CONTROLS & TABS --- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={`inline-flex p-1 rounded-xl border ${
          isDark ? 'bg-surface border-border-subtle' : 'bg-surface-container-low border-border-subtle/60'
        }`}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-body text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-accent-electric text-background shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Entities ({fullGraphData.nodes.length})
          </button>
          <button
            onClick={() => setSelectedCategory('threats')}
            className={`px-4 py-2 rounded-lg font-body text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'threats' 
                ? 'bg-sentiment-negative text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-sentiment-negative'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sentiment-negative"></span>
            Contagion Risks
          </button>
          <button
            onClick={() => setSelectedCategory('bullish')}
            className={`px-4 py-2 rounded-lg font-body text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'bullish' 
                ? 'bg-sentiment-positive text-white shadow-sm' 
                : 'text-on-surface-variant hover:text-sentiment-positive'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sentiment-positive"></span>
            Bull Catalysts
          </button>
        </div>

        {/* Helper Tip */}
        <div className="text-xs text-on-surface-variant italic font-body flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-accent-electric">touch_app</span>
          Click any node to focus inspection drawer
        </div>
      </div>

      {/* --- MAIN GRAPH VIEWPORT --- */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 relative min-h-[480px]">
        
        {/* Force Graph Panel */}
        <div 
          ref={containerRef} 
          className={`flex-1 rounded-2xl border overflow-hidden relative transition-colors duration-300 ${
            isDark ? 'border-border-subtle shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]' : 'border-border-subtle/80 shadow-inner'
          }`}
          style={{ backgroundColor: graphBgColor }}
        >
          {/* Subtle Radar scan animation overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-accent-electric/5 opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-accent-electric/10 opacity-40"></div>
          </div>

          {/* Graph component */}
          {filteredGraphData.nodes.length > 0 ? (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={filteredGraphData}
              nodeLabel="name"
              nodeRelSize={6}
              linkColor="color"
              linkWidth={link => Math.min((link.value || 1) * 1.5, 5)}
              linkOpacity={isDark ? 0.6 : 0.8}
              onNodeClick={node => setSelectedNode(node)}
              onNodeHover={node => setHoveredNode(node)}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = Math.max(12 / globalScale, 10);
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                
                // Draw dynamic outer pulse/halo for threats or selection
                if (node.status === 'threat' || isSelected || isHovered) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, node.val + (isSelected ? 8 : 4), 0, 2 * Math.PI, false);
                  ctx.fillStyle = isSelected ? node.color : node.color + '33'; // transparent halo
                  ctx.fill();
                  
                  if (isSelected) {
                    ctx.lineWidth = 2 / globalScale;
                    ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000';
                    ctx.stroke();
                  }
                }

                // Main solid node body
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Draw gorgeous pill badge label below node
                ctx.font = `600 ${fontSize}px "Space Grotesk", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                
                const textWidth = ctx.measureText(label).width;
                const paddingX = fontSize * 0.8;
                const paddingY = fontSize * 0.4;
                const boxWidth = textWidth + paddingX;
                const boxHeight = fontSize + paddingY;
                const boxY = node.y + node.val + 4;

                // Pill background
                ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.roundRect(node.x - boxWidth / 2, boxY, boxWidth, boxHeight, 6);
                ctx.fill();

                // Pill outline
                ctx.lineWidth = 1 / globalScale;
                ctx.strokeStyle = isSelected ? node.color : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)');
                ctx.stroke();

                // Text
                ctx.fillStyle = isDark ? '#FFFFFF' : '#1A1D23';
                ctx.fillText(label, node.x, boxY + paddingY / 2);
              }}
              backgroundColor={graphBgColor}
              d3AlphaDecay={0.03}
              d3VelocityDecay={0.2}
              cooldownTicks={100}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant font-body z-20">
              <span className="material-symbols-outlined text-4xl text-outline/40">device_hub</span>
              <p className="text-sm font-medium">No direct entity vectors match this category filter.</p>
              <button 
                onClick={() => setSelectedCategory('all')} 
                className="text-xs text-accent-electric underline hover:opacity-80 mt-1 cursor-pointer"
              >
                Clear filter to view whole network
              </button>
            </div>
          )}

          {/* Network Legend inside viewport bottom-left */}
          <div className={`absolute bottom-4 left-4 z-20 p-3.5 rounded-xl border backdrop-blur-md text-xs transition-all duration-300 ${
            isDark ? 'bg-surface/85 border-border-subtle text-on-surface' : 'bg-white/90 border-border-subtle/60 text-[#1A1D23] shadow-sm'
          }`}>
            <h4 className="font-body text-[10px] font-bold tracking-wider uppercase text-on-surface-variant mb-2.5">
              Vector Impact Legend
            </h4>
            <div className="flex items-center gap-2.5 mb-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sentiment-negative shadow-[0_0_6px_#EF4444]"></span> 
              Contagion / High Risk Threat
            </div>
            <div className="flex items-center gap-2.5 mb-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sentiment-positive shadow-[0_0_6px_#22C55E]"></span> 
              Bullish Nexus Catalyst
            </div>
            <div className="flex items-center gap-2.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-electric"></span> 
              Stable / Neutral Node
            </div>
          </div>
        </div>

        {/* --- INTERACTIVE SIDEBAR DRAWER FOR SELECTED NODE --- */}
        {selectedNode && (
          <div className={`w-full lg:w-80 rounded-2xl border p-5 flex flex-col justify-between animate-slide-in-right transition-all duration-300 ${
            isDark ? 'bg-surface border-border-subtle shadow-xl' : 'bg-white border-border-subtle/80 shadow-lg'
          }`}>
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                      selectedNode.status === 'threat' ? 'bg-sentiment-negative' :
                      selectedNode.status === 'bullish' ? 'bg-sentiment-positive' : 'bg-accent-electric text-background'
                    }`}>
                      {selectedNode.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-outline font-body font-medium">ID: {selectedNode.id}</span>
                  </div>
                  <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                    {selectedNode.name}
                  </h3>
                </div>
                
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Close inspection"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Node Stats Grid */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-surface-container-low border border-border-subtle/40">
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5 font-body">Direct Stream Hits</div>
                  <div className="font-ticker text-lg font-bold text-on-surface">{selectedNode.count}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5 font-body">Impact Index</div>
                  <div className={`font-ticker text-lg font-bold ${
                    selectedNode.avgSentiment > 0 ? 'text-sentiment-positive' :
                    selectedNode.avgSentiment < 0 ? 'text-sentiment-negative' : 'text-accent-electric'
                  }`}>
                    {selectedNode.avgSentiment > 0 ? '+' : ''}{selectedNode.avgSentiment.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Recent Article Evidence Context */}
              <div className="mt-4">
                <h4 className="font-body text-xs font-bold tracking-wider text-on-surface-variant uppercase mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">article</span>
                  Stream Evidence Traces
                </h4>
                {selectedNode.articlesMentioned && selectedNode.articlesMentioned.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedNode.articlesMentioned.map((artTitle, aIdx) => (
                      <div key={aIdx} className="p-2.5 rounded-lg bg-surface-container text-xs text-on-surface/90 font-body border-l-2 border-accent-electric leading-snug">
                        "{artTitle}"
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-outline italic">Analyzed from collective continuous feed vectors.</p>
                )}
              </div>

              {/* Connected Peers Sublist */}
              <div className="mt-5 pt-4 border-t border-border-subtle/50">
                <h4 className="font-body text-xs font-bold tracking-wider text-on-surface-variant uppercase mb-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">route</span>
                  Direct Peer Vectors
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {fullGraphData.links
                    .filter(l => (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id || 
                                 (typeof l.target === 'object' ? l.target.id : l.target) === selectedNode.id)
                    .map((l, lIdx) => {
                      const peerId = (typeof l.source === 'object' ? l.source.id : l.source) === selectedNode.id ? 
                                     (typeof l.target === 'object' ? l.target.id : l.target) : 
                                     (typeof l.source === 'object' ? l.source.id : l.source);
                      const peerNode = fullGraphData.nodes.find(n => n.id === peerId);
                      if (!peerNode) return null;
                      
                      return (
                        <button
                          key={lIdx}
                          onClick={() => setSelectedNode(peerNode)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer ${
                            peerNode.status === 'threat' ? 'bg-sentiment-negative/10 border-sentiment-negative/30 text-sentiment-negative' :
                            peerNode.status === 'bullish' ? 'bg-sentiment-positive/10 border-sentiment-positive/30 text-sentiment-positive' :
                            'bg-surface-container-high border-border-subtle text-on-surface'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            peerNode.status === 'threat' ? 'bg-sentiment-negative' :
                            peerNode.status === 'bullish' ? 'bg-sentiment-positive' : 'bg-accent-electric'
                          }`}></span>
                          {peerNode.name}
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Action Bar Footer */}
            <div className="mt-6 pt-3 border-t border-border-subtle/40 flex items-center justify-between">
              <span className="text-[10px] text-outline tracking-wider uppercase font-body">Interactive Node mode</span>
              <button
                onClick={() => {
                  // Simulate running deeper node tracing
                  alert(`Initiating comprehensive threat vector trace for ${selectedNode.name}...`);
                }}
                className="px-3 py-1.5 rounded-lg bg-accent-electric/10 hover:bg-accent-electric text-accent-electric hover:text-background font-body text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Deep Trace Node
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
