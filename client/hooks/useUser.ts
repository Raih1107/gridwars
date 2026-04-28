import { useEffect, useState } from 'react';

// ─── Display names ─────────────────────────────────────────────────────────────
// Fun, competitive-sounding usernames that make the grid feel alive
const ADJECTIVES = [
  'Shadow', 'Neon', 'Cosmic', 'Turbo', 'Hyper', 'Ghost', 'Solar', 'Pixel',
  'Blaze', 'Frost', 'Storm', 'Venom', 'Thunder', 'Rapid', 'Rogue', 'Cyber',
];

const NOUNS = [
  'Wolf', 'Hawk', 'Panda', 'Raven', 'Drake', 'Fox', 'Titan', 'Viper',
  'Lynx', 'Eagle', 'Bear', 'Shark', 'Knight', 'Phoenix', 'Hydra', 'Comet',
];

//Color palette 
// Vivid, distinct colors that look great on the dark grid background
const COLORS = [
  '#FF3366', // Neon Pink
  '#33FFAA', // Electric Mint
  '#338BFF', // Royal Blue
  '#FFD700', // Gold
  '#FF6B35', // Vivid Orange
  '#33FFF6', // Cyan
  '#C133FF', // Deep Purple
  '#FF33F3', // Magenta
  '#00FF87', // Lime
  '#FF9500', // Amber
  '#FF4560', // Coral
  '#00E5FF', // Ice Blue
  '#7BFF33', // Acid Green
  '#FF3399', // Hot Pink
  '#33DDFF', // Sky
  '#FFAA00', // Honey
];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateUsername = () =>
  `${randomItem(ADJECTIVES)}${randomItem(NOUNS)}`;

export interface User {
  id: string;
  username: string;
  color: string;
}

/**
 * useUser - Persists a randomly generated user identity in localStorage.
 * Returns null during SSR / before hydration.
 */
export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gridwars-user');

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        // Migrate old users that only have `id` and no `username`
        if (!parsed.username) {
          parsed.username = generateUsername();
          localStorage.setItem('gridwars-user', JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch {
        // Corrupted data — create fresh user
        localStorage.removeItem('gridwars-user');
      }
    }

    if (!saved) {
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        username: generateUsername(),
        color: randomItem(COLORS),
      };
      localStorage.setItem('gridwars-user', JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  return user;
};