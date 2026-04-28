import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


const GRID_SIZE = 25; // 30x30 = 900 blocks

/**
 * In-memory grid state (source of truth).
 * Format: { "x,y": { userId, color, username, timestamp } }
 */
let gridState = {};

// Per-user cooldown map
// Prevents spamming: users can only place a block every COOLDOWN_MS milliseconds
const COOLDOWN_MS = 400;
const lastCapture = {}; // { socketId: timestamp }

// Broadcast helpers
const broadcastUserCount = () => {
  io.emit('user_count', io.engine.clientsCount);
};

/**
 * Derives a leaderboard array sorted by block count (descending).
 * Shape: [{ userId, username, color, count }]
 */
const computeLeaderboard = () => {
  const tally = {};

  for (const key in gridState) {
    const block = gridState[key];
    if (!block || !block.userId) continue;

    if (!tally[block.userId]) {
      tally[block.userId] = {
        userId: block.userId,
        username: block.username || block.userId,
        color: block.color,
        count: 0,
      };
    }
    tally[block.userId].count += 1;
  }

  return Object.values(tally)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
};

// REST endpoint: health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connectedClients: io.engine.clientsCount,
    blocksCaputred: Object.keys(gridState).length,
    gridSize: GRID_SIZE,
  });
});

// To keep the backend alive
app.get('/ping', (_req, res) => {
  res.send('pong');
});

// Socket Logic
io.on('connection', (socket) => {
  console.log(`[+] User connected:  ${socket.id}`);

  // Announce updated user count to everyone
  broadcastUserCount();

  // 1. Send the full current grid state to the newly connected user
  socket.emit('init_grid', { gridState, gridSize: GRID_SIZE });

  // 2. Send current leaderboard to the new user
  socket.emit('leaderboard', computeLeaderboard());

  // 3. Handle block capture events
  socket.on('capture_block', (data) => {
    const { x, y, userId, color, username } = data;

    //Validate inputs
    if (
      x === undefined ||
      y === undefined ||
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      x < 0 || x >= GRID_SIZE ||
      y < 0 || y >= GRID_SIZE
    ) {
      console.warn(`[!] Invalid block capture attempt from ${socket.id}:`, data);
      return; // Silently reject invalid captures
    }

    if (!userId || !color) {
      console.warn(`[!] Missing userId or color from ${socket.id}`);
      return;
    }

    // Cooldown check 
    const now = Date.now();
    if (lastCapture[socket.id] && now - lastCapture[socket.id] < COOLDOWN_MS) {
      // User is placing too fast — silently drop, no penalty
      return;
    }
    lastCapture[socket.id] = now;

    // Update server state 
    const key = `${x},${y}`;
    gridState[key] = {
      userId,
      color,
      username: username || userId,
      timestamp: now,
    };

    // Broadcast update to ALL users
    io.emit('block_updated', {
      x,
      y,
      ...gridState[key],
    });

    // Broadcast updated leaderboard to ALL users
    io.emit('leaderboard', computeLeaderboard());
  });

  // 4. Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    delete lastCapture[socket.id]; // Clean up cooldown map
    broadcastUserCount();
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n✅  GridWars backend is running at http://localhost:${PORT}`);
  console.log(`   Grid Size : ${GRID_SIZE}x${GRID_SIZE} (${GRID_SIZE * GRID_SIZE} blocks)`);
  console.log(`   Cooldown  : ${COOLDOWN_MS}ms per user\n`);
});

