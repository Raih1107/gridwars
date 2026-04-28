import { socket } from '@/lib/socket';
import { useCallback, useEffect, useState } from 'react';

// Types 
export type BlockData = {
  userId: string;
  username: string;
  color: string;
  timestamp: number;
};

export type GridState = Record<string, BlockData>;

export type LeaderboardEntry = {
  userId: string;
  username: string;
  color: string;
  count: number;
};

// Hook 
/**
 * useGrid - manages all grid state and socket event listeners.
 * 
 * Returns:
 *  - grid: the current full grid state
 *  - leaderboard: top 10 players by block count
 *  - captureBlock: function to emit a capture event to the server
 *  - gridSize: the grid dimension from the server
 */
export const useGrid = () => {
  const [grid, setGrid] = useState<GridState>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gridSize, setGridSize] = useState(25);

  useEffect(() => {
    // Receive the initial full board snapshot from the server
    const onInitGrid = ({ gridState, gridSize }: { gridState: GridState; gridSize: number }) => {
      setGrid(gridState);
      setGridSize(gridSize);
    };

    // A single block was updated — apply the minimal patch to avoid re-rendering everything
    const onBlockUpdated = (data: { x: number; y: number } & BlockData) => {
      setGrid((prev) => ({
        ...prev,
        [`${data.x},${data.y}`]: {
          userId: data.userId,
          username: data.username,
          color: data.color,
          timestamp: data.timestamp,
        },
      }));
    };

    // Receive the updated leaderboard after each capture
    const onLeaderboard = (entries: LeaderboardEntry[]) => {
      setLeaderboard(entries);
    };

    socket.on('init_grid', onInitGrid);
    socket.on('block_updated', onBlockUpdated);
    socket.on('leaderboard', onLeaderboard);

    return () => {
      socket.off('init_grid', onInitGrid);
      socket.off('block_updated', onBlockUpdated);
      socket.off('leaderboard', onLeaderboard);
    };
  }, []);

  /**
   * Emits a capture_block event to the server.
   * The server validates and broadcasts the update to all users.
   */
  const captureBlock = useCallback(
    (x: number, y: number, userId: string, color: string, username: string) => {
      socket.emit('capture_block', { x, y, userId, color, username });
    },
    []
  );

  return { grid, leaderboard, captureBlock, gridSize };
};