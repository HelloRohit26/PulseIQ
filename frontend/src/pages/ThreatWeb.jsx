import { useMemo, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function ThreatWeb({ articles = [] }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    // We will extract common entities from articles to build the web
    const entities = ['Nvidia', 'Apple', 'Microsoft', 'Google', 'China', 'US', 'Fed', 'Crypto', 'Bitcoin', 'Energy', 'Oil', 'Tesla', 'Amazon', 'Meta', 'Europe', 'Japan'];
    
    const nodesMap = new Map();
    const linksMap = new Map();

    // Base nodes
    entities.forEach(e => {
      nodesMap.set(e, { id: e, name: e, val: 2, sentimentScore: 0, count: 0 });
    });

    articles.forEach(article => {
      const text = (article.title + " " + (article.content || "")).toLowerCase();
      
      // Find entities mentioned in this article
      const mentioned = entities.filter(e => text.includes(e.toLowerCase()));
      
      const artScore = article.sentiment?.toLowerCase() === 'positive' ? article.score : -article.score;

      // Update node scores and sizes
      mentioned.forEach(e => {
        const node = nodesMap.get(e);
        node.val += 1;
        node.sentimentScore += artScore;
        node.count += 1;
      });

      // Create links between entities in the same article
      for (let i = 0; i < mentioned.length; i++) {
        for (let j = i + 1; j < mentioned.length; j++) {
          const source = mentioned[i];
          const target = mentioned[j];
          const linkId = [source, target].sort().join('-');
          
          if (!linksMap.has(linkId)) {
            linksMap.set(linkId, { source, target, value: 1, sentiment: artScore });
          } else {
            const link = linksMap.get(linkId);
            link.value += 1;
            link.sentiment += artScore;
          }
        }
      }
    });

    const activeNodes = Array.from(nodesMap.values()).filter(n => n.count > 0);
    
    // Assign colors based on sentiment
    activeNodes.forEach(n => {
      const avg = n.sentimentScore / n.count;
      n.color = avg > 0.1 ? '#22C55E' : avg < -0.1 ? '#EF4444' : '#00E5FF';
      // If it's a threat (highly negative and highly mentioned), make it bigger
      if (avg < -0.2 && n.val > 5) n.isThreat = true;
    });

    const links = Array.from(linksMap.values()).map(l => ({
      source: l.source,
      target: l.target,
      value: l.value,
      color: l.sentiment > 0 ? 'rgba(34, 197, 94, 0.4)' : l.sentiment < 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(0, 229, 255, 0.3)'
    }));

    return { nodes: activeNodes, links };
  }, [articles]);

  return (
    <div className="p-(--spacing-container-margin) h-[calc(100vh-73px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-[32px] font-semibold text-on-surface mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-sentiment-negative text-3xl animate-pulse">radar</span>
            Entity Threat Web
          </h1>
          <p className="text-on-surface-variant text-sm font-body">Real-time nodal mapping of global market entities and contagion risks.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-surface border border-border-subtle p-3 rounded flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sentiment-negative shadow-[0_0_8px_#EF4444] animate-pulse"></div>
            <div>
              <p className="font-body text-[10px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Primary Contagion Risk</p>
              <p className="font-ticker text-[14px] font-bold text-sentiment-negative">
                {graphData.nodes.filter(n => n.isThreat).sort((a,b) => b.val - a.val)[0]?.name || "None Detected"}
              </p>
            </div>
          </div>
          <div className="bg-surface border border-border-subtle p-3 rounded flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sentiment-positive shadow-[0_0_8px_#22C55E]"></div>
            <div>
              <p className="font-body text-[10px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">Bullish Nexus</p>
              <p className="font-ticker text-[14px] font-bold text-sentiment-positive">
                {graphData.nodes.filter(n => n.color === '#22C55E').sort((a,b) => b.val - a.val)[0]?.name || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Force Graph Container */}
      <div 
        ref={containerRef} 
        className="flex-1 bg-[#0D1117] border border-border-subtle rounded-lg overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-electric/5 via-transparent to-transparent pointer-events-none z-10"></div>
        
        {/* Graph Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-20 bg-surface/80 backdrop-blur-md border border-border-subtle p-4 rounded text-xs text-on-surface">
          <h4 className="font-body font-semibold tracking-[0.05em] uppercase text-on-surface-variant mb-2">Network Legend</h4>
          <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-sentiment-negative"></span> Bearish Target</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-sentiment-positive"></span> Bullish Catalyst</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-accent-electric"></span> Neutral Entity</div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle"><div className="w-4 h-1 bg-sentiment-negative/60"></div> Contagion Link</div>
        </div>

        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="id"
            nodeColor="color"
            nodeRelSize={4}
            linkColor="color"
            linkWidth={link => Math.min(link.value * 0.5, 4)}
            linkOpacity={0.6}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px "Space Grotesk"`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = 'rgba(13, 17, 23, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              
              if (node.isThreat) {
                ctx.shadowColor = '#EF4444';
                ctx.shadowBlur = 10;
              } else {
                ctx.shadowBlur = 0;
              }

              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
              ctx.fillStyle = color;
              const bckgDimensions = node.__bckgDimensions;
              bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            }}
            backgroundColor="#0D1117"
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-body">
            Awaiting entity mapping stream...
          </div>
        )}
      </div>
    </div>
  );
}
