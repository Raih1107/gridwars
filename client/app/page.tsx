'use client';

import { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useUser } from '@/hooks/useUser';
import { useGrid } from '@/hooks/useGrid';
import { Block } from '@/components/Block';
import { Leaderboard } from '@/components/Leaderboard';
import { Monitor, Users, Loader2, Sparkles, Activity, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function Home() {
  const user = useUser();
  const { grid, leaderboard, captureBlock, gridSize } = useGrid();
  
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only connect the socket once the component actually mounts (client-side)
    socket.connect();
    
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onUserCount = (count: number) => setOnlineCount(count);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('user_count', onUserCount);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('user_count', onUserCount);
      socket.disconnect();
    };
  }, []);

  if (!user) return null;

  return (
    <main className="min-h-screen dot-bg text-slate-200 flex flex-col font-sans h-screen overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="p-4 border-b border-[var(--border-subtle)] glass flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white glow-indigo">
            <Monitor size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none text-white uppercase italic">GridWars</h1>
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.2em]">Alpha Build</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] rounded-full border border-[var(--border-subtle)] shadow-inner">
            <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: user.color }} />
            <span className="text-slate-300 text-xs font-bold tracking-wide">{user.username}</span>
          </div>

          <div className="px-[1px] h-6 bg-slate-800" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800 shadow-inner">
            <Users size={14} className="text-indigo-400" />
            <span className="text-indigo-100 font-bold text-xs">{onlineCount}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black border transition-colors ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 live-dot' : 'bg-rose-400'}`} />
              {isConnected ? 'LIVE' : 'DOWN'}
          </div>
        </div>
      </header>

      {/* ── Main Workspace ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar / Leaderboard */}
        <aside className="w-80 border-r border-[var(--border-subtle)] glass p-5 flex flex-col gap-6 overflow-y-auto hidden md:flex shrink-0 z-40 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
          
          <Leaderboard 
            entries={leaderboard} 
            currentUserId={user.id} 
            totalBlocks={Object.keys(grid).length}
            gridSize={gridSize}
          />
          
          <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-slate-500" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol Rules</p>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-2 font-mono">
              <li>» Click any empty tile to capture it.</li>
              <li>» Capturing over an existing tile is forbidden.</li>
              <li>» Respect the 400ms cooldown limiter.</li>
              <li>» Maximum dominance wins.</li>
            </ul>
          </div>
        </aside>

        {/* Grid Canvas */}
        <div className="flex-1 relative overflow-auto touch-pan-both bg-[#050810]" ref={containerRef}>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 z-50 flex gap-2 glass p-1.5 rounded-2xl border-[var(--border-subtle)] shadow-2xl">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
              <ZoomOut size={18} />
            </button>
            <div className="px-2 flex items-center justify-center text-xs font-mono font-bold text-slate-500 min-w-12">
              {Math.round(zoom * 100)}%
            </div>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
              <ZoomIn size={18} />
            </button>
          </div>

          {!isConnected ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/50 backdrop-blur-md z-50">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Synchronizing...</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center min-bg-[2000px] min-h-[1000px]">
              
              <motion.div 
                className="relative bg-[#0b1120] border border-[var(--border-subtle)] shadow-[0_0_100px_rgba(0,0,0,1)]"
                animate={{ scale: zoom }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                style={{
                  width: `${gridSize * 18}px`,
                  height: `${gridSize * 18}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                  gap: '1px',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                  const x = i % gridSize;
                  const y = Math.floor(i / gridSize);
                  const blockData = grid[`${x},${y}`];

                  return (
                    <Block
                      key={`${x},${y}`}
                      ownerColor={blockData?.color}
                      ownerName={blockData?.username}
                      isOwn={blockData?.userId === user.id}
                      onClick={() => !blockData && captureBlock(x, y, user.id, user.color, user.username)}
                    />
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}