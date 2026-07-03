interface MemeCatProps {
  mood: 'confused' | 'happy' | 'sad';
  size?: number;
  className?: string;
}

// Original flat-vector cat face, no external assets — matches the site's
// emerald/rose terminal palette (see sql-fishing's PixelCat ASCII art).
export function MemeCat({ mood, size = 64, className }: MemeCatProps) {
  const accent = mood === 'happy' ? '#34d399' : mood === 'sad' ? '#fb7185' : '#fbbf24';

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={
        mood === 'happy'
          ? 'Довольный кот'
          : mood === 'sad'
            ? 'Расстроенный кот'
            : 'Растерянный кот'
      }
    >
      <path d="M14 10 L22 24 L10 26 Z" fill="#18181b" stroke={accent} strokeWidth="1.5" />
      <path d="M50 10 L42 24 L54 26 Z" fill="#18181b" stroke={accent} strokeWidth="1.5" />
      <circle cx="32" cy="34" r="22" fill="#18181b" stroke={accent} strokeWidth="1.5" />

      {mood === 'happy' && (
        <>
          <path d="M20 32 Q24 27 28 32" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 32 Q40 27 44 32" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M25 42 Q32 48 39 42" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {mood === 'sad' && (
        <>
          <path d="M21 29 L27 35 M27 29 L21 35" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M37 29 L43 35 M43 29 L37 35" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M25 46 Q32 41 39 46" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 38 L16 44" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {mood === 'confused' && (
        <>
          <circle cx="24" cy="32" r="2.5" fill={accent} />
          <circle cx="40" cy="32" r="2.5" fill={accent} />
          <path d="M27 43 Q32 40 37 44" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      <path
        d="M10 34 L2 32 M10 38 L2 39 M54 34 L62 32 M54 38 L62 39"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
