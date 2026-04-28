# GridWars - Real-Time Shared Grid App

GridWars is an interactive, real-time shared multiplayer grid game where users compete to capture territory on a global board. Built as a high-performance WebSockets application, it demonstrates scalable state management, modern premium UI/UX design (glassmorphism), and real-time multiplayer synchronization.

## Live Demo & Links
- **Deployed App Link:** https://gridwars-ochre.vercel.app/
- **GitHub Repository:** https://github.com/Raih1107/gridwars/
---

## 🛠 Tech Stack Used
### Frontend
- **Next.js 16 (React 19)**: Selected for its modern routing, optimized rendering, and ease of deployment.
- **Tailwind CSS v4 & Framer Motion**: Powering the premium glassmorphism UI, smooth grid interactions, responsive layouts, and physics-based animations (zooming, hovering, block snapping).
- **Socket.io-client**: Used over native WebSockets to automatically handle connection drops, reconnections, and fallback transports gracefully.
- **Lucide-react**: For beautiful, crisp SVG icons.

### Backend
- **Node.js & Express**: Provides a lightweight, un-opinionated HTTP layer to bind the WebSocket server.
- **Socket.io**: Handles the real-time bidirectional event-driven communication between the server and an arbitrary number of connected clients.
- **In-Memory Store**: Grid state and user stats are kept in memory for `<1ms` read/write latency.


---

## 📖 Local Setup Instructions

**1. Clone the repository**
```bash
git clone gridwars

```

**2. Start the Backend**
```bash
cd server
npm install
npm run dev
```
*(Runs on localhost:4000)*

**3. Start the Frontend**
```bash
cd client
npm install
npm run dev
```
*(Runs on localhost:3000)*

Open multiple browser windows to test the real-time syncing!
# gridwars
