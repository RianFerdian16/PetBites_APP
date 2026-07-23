import { Bird as BirdIcon, Leaf, Sparkles } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark__body" />
      <span className="brand-mark__wing" />
      <span className="brand-mark__beak" />
      {!compact && <span className="brand-mark__leaf" />}
    </div>
  );
}

export function HeroBirdScene() {
  return (
    <div className="hero-bird-scene" aria-hidden="true">
      <svg viewBox="0 0 560 440" role="presentation">
        <defs>
          <linearGradient id="birdBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--primary-strong)" />
          </linearGradient>
          <linearGradient id="birdWing" x1="0" x2="1">
            <stop offset="0" stopColor="var(--coral)" />
            <stop offset="1" stopColor="var(--amber-warm)" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodOpacity="0.14" />
          </filter>
        </defs>

        <circle cx="390" cy="128" r="92" fill="var(--mint)" opacity="0.72" />
        <circle cx="170" cy="288" r="118" fill="var(--amber-soft)" opacity="0.7" />

        <g className="hero-bird-scene__branch">
          <path
            d="M86 350c105-13 213-18 387-5"
            fill="none"
            stroke="var(--branch)"
            strokeLinecap="round"
            strokeWidth="18"
          />
          <path
            d="M150 345c-35-28-55-59-61-92M411 346c32-31 49-61 53-90"
            fill="none"
            stroke="var(--branch)"
            strokeLinecap="round"
            strokeWidth="9"
          />
          <g fill="var(--leaf)">
            <ellipse cx="82" cy="249" rx="17" ry="35" transform="rotate(-35 82 249)" />
            <ellipse cx="112" cy="276" rx="16" ry="31" transform="rotate(48 112 276)" />
            <ellipse cx="470" cy="250" rx="17" ry="35" transform="rotate(35 470 250)" />
            <ellipse cx="439" cy="278" rx="16" ry="31" transform="rotate(-48 439 278)" />
          </g>
        </g>

        <g className="hero-bird-scene__bird" filter="url(#softShadow)">
          <path
            d="M279 125c74 0 126 56 126 129 0 50-27 84-68 99-43 16-107 6-139-31-27-31-35-86-17-130 18-42 53-67 98-67Z"
            fill="url(#birdBody)"
          />
          <circle cx="322" cy="142" r="50" fill="var(--cream)" />
          <circle cx="338" cy="130" r="7" fill="var(--ink)" />
          <circle cx="340" cy="128" r="2" fill="white" />
          <path d="M369 147l45 17-43 18Z" fill="var(--coral)" />
          <path
            className="hero-bird-scene__wing"
            d="M286 211c-24 8-52 44-55 89 39 10 91-11 116-59-13-23-34-37-61-30Z"
            fill="url(#birdWing)"
          />
          <path d="M221 293l-66 66 91-28Z" fill="var(--primary-strong)" />
          <path d="M243 311l-38 73 76-57Z" fill="var(--coral)" />
          <path
            d="M259 344c-8 21-7 35 5 43M315 347c-3 21 1 34 15 42"
            fill="none"
            stroke="var(--branch)"
            strokeLinecap="round"
            strokeWidth="7"
          />
        </g>

        <g className="hero-bird-scene__sparkles" fill="var(--coral)">
          <circle cx="118" cy="126" r="5" />
          <circle cx="467" cy="186" r="4" />
          <path d="M139 93l5 13 13 5-13 5-5 13-5-13-13-5 13-5Z" />
          <path d="M454 93l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
        </g>
      </svg>

      <div className="hero-bird-scene__note hero-bird-scene__note--top">
        <Sparkles className="h-4 w-4" />
        Data terstruktur
      </div>
      <div className="hero-bird-scene__note hero-bird-scene__note--bottom">
        <Leaf className="h-4 w-4" />
        Praktis dipakai
      </div>
    </div>
  );
}

export function FlyingBird() {
  return (
    <div className="flying-bird" aria-hidden="true">
      <div className="flying-bird__trail" />
      <div className="flying-bird__body">
        <BirdIcon className="flying-bird__icon" strokeWidth={1.8} />
        <span className="flying-bird__wing flying-bird__wing--left" />
        <span className="flying-bird__wing flying-bird__wing--right" />
      </div>
    </div>
  );
}
