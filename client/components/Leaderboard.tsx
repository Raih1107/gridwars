'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Zap } from 'lucide-react';
import { LeaderboardEntry } from '@/hooks/useGrid';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  totalBlocks: number;
  gridSize: number;
}

const RANK_STYLES = [
  { icon: <Crown size={12} />, bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { icon: <Crown size={12} />, bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300' },
  { icon: <Crown size={12} />, bg: 'from-orange-700/20 to-orange-800/10', border: 'border-orange-600/30', text: 'text-orange-400' },
];

export const Leaderboard = ({ entries, currentUserId, totalBlocks, gridSize }: LeaderboardProps) => {
  const maxCount = entries[0]?.count || 1;
  const totalCells = gridSize * gridSize;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Trophy size={14} className="text-amber-400" />
        </div>
        <h2 className="text-xs font-black tracking-widest uppercase text-slate-300">Leaderboard</h2>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-black text-indigo-400 font-mono">{totalBlocks}</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Captured</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-black text-slate-300 font-mono">{totalCells - totalBlocks}</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Free</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalBlocks / totalCells) * 100, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[9px] text-slate-500 font-mono text-right -mt-2">
        {((totalBlocks / totalCells) * 100).toFixed(1)}% of grid captured
      </p>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <Zap size={20} className="text-slate-700" />
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">No captures yet</p>
          <p className="text-[9px] text-slate-700">Be the first to claim a block!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {entries.map((entry, i) => {
              const isYou = entry.userId === currentUserId;
              const rankStyle = RANK_STYLES[i] ?? null;
              const pct = Math.round((entry.count / maxCount) * 100);

              return (
                <motion.div
                  key={entry.userId}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className={`relative rounded-xl border p-2.5 bg-gradient-to-r overflow-hidden
                    ${rankStyle ? `${rankStyle.bg} ${rankStyle.border}` : 'bg-slate-900/50 border-slate-800/70'}
                    ${isYou ? 'ring-1 ring-indigo-500/40' : ''}
                  `}
                >
                  {/* Fill bar behind */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-xl opacity-10 transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: entry.color }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center gap-2.5">
                    {/* Rank number */}
                    <span className={`text-[10px] font-black w-4 text-center ${rankStyle ? rankStyle.text : 'text-slate-600'}`}>
                      {rankStyle ? rankStyle.icon : `${i + 1}`}
                    </span>

                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10"
                      style={{ backgroundColor: entry.color }}
                    />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold truncate ${isYou ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {entry.username}
                        {isYou && <span className="ml-1 text-[8px] text-indigo-400 font-black uppercase tracking-wider">(you)</span>}
                      </p>
                    </div>

                    {/* Count */}
                    <span className="text-[11px] font-black font-mono text-slate-200 flex-shrink-0">
                      {entry.count}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
