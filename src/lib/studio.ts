import type { StudioDraftInput, Track } from '@/types/music';

const AUDIO_BY_GENRE: Record<string, string> = {
  Afrobeats: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  'Hip-Hop': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  Gospel: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  Pop: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'R&B': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  Default: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
};

const MOOD_COLORS: Record<string, [string, string]> = {
  Chill: ['#0f766e', '#22d3ee'],
  Energetic: ['#f97316', '#facc15'],
  Reflective: ['#4338ca', '#a78bfa'],
  Warm: ['#fb7185', '#fdba74'],
  Confident: ['#16a34a', '#bef264'],
  Dark: ['#0f172a', '#475569'],
};

export function createStudioTrack({ prompt, genre, mood }: StudioDraftInput): Track {
  const cleanPrompt = prompt.trim();
  const title = buildTitle(cleanPrompt, genre, mood);
  const artist = buildArtistName(cleanPrompt);
  const albumArt = buildAlbumArt({
    title,
    genre,
    mood,
    prompt: cleanPrompt,
  });

  return {
    id: createId('studio'),
    title,
    artist,
    album: 'Studio Sessions',
    albumArt,
    url: AUDIO_BY_GENRE[genre] || AUDIO_BY_GENRE.Default,
    duration: 198,
    genre,
    mood,
    lyrics: buildLyrics(cleanPrompt, mood),
    source: 'studio',
    description: `Built from your prompt with a ${mood.toLowerCase()} ${genre.toLowerCase()} direction.`,
  };
}

export function buildAlbumArt({
  title,
  genre,
  mood,
  prompt,
}: {
  title: string;
  genre: string;
  mood: string;
  prompt: string;
}) {
  const [from, to] = MOOD_COLORS[mood] || ['#1d4ed8', '#7c3aed'];
  const texture = escapeSvg(prompt.slice(0, 52).toUpperCase());
  const safeTitle = escapeSvg(title.toUpperCase());
  const safeGenre = escapeSvg(`${genre} / ${mood}`.toUpperCase());
  const seed = hashValue(`${title}-${genre}-${mood}`);
  const ringOffset = 80 + (seed % 180);
  const rotation = seed % 360;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>
      <rect width="1200" height="1200" fill="#050816" />
      <rect width="1200" height="1200" fill="url(#bg)" opacity="0.85" />
      <circle cx="300" cy="220" r="220" fill="white" opacity="0.08" filter="url(#blur)" />
      <circle cx="980" cy="930" r="250" fill="#ffffff" opacity="0.06" filter="url(#blur)" />
      <g transform="rotate(${rotation} 600 600)">
        <rect x="${ringOffset}" y="140" width="700" height="700" rx="120" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="18" />
      </g>
      <text x="100" y="160" fill="white" font-size="44" font-family="Arial, sans-serif" opacity="0.7">${safeGenre}</text>
      <text x="100" y="880" fill="white" font-size="120" font-weight="700" font-family="Arial, sans-serif">${safeTitle}</text>
      <text x="100" y="960" fill="white" font-size="34" font-family="Arial, sans-serif" opacity="0.8">${texture}</text>
      <text x="100" y="1060" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.65">GAMERO STUDIO</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildTitle(prompt: string, genre: string, mood: string) {
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${capitalize(words[0])} ${capitalize(words[1])}`;
  }

  if (words.length === 1) {
    return `${capitalize(words[0])} ${capitalize(mood)}`;
  }

  return `${capitalize(mood)} ${capitalize(genre)}`;
}

function buildArtistName(prompt: string) {
  const seed = hashValue(prompt);
  const first = ['Nova', 'Astra', 'Lyric', 'Echo', 'Mira', 'Velvet'][seed % 6];
  const last = ['Line', 'House', 'North', 'Lane', 'Pulse', 'Theory'][(seed >> 2) % 6];
  return `${first} ${last}`;
}

function buildLyrics(prompt: string, mood: string) {
  const focus = prompt.trim() || 'your story';
  return [
    `We built a lane from ${focus.toLowerCase()},`,
    `kept the drums close and the skyline wide,`,
    `let the ${mood.toLowerCase()} feeling carry the chorus,`,
    'then left enough room for the moment to breathe.',
  ].join('\n');
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashValue(value: string) {
  return Array.from(value).reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0) >>> 0;
}
