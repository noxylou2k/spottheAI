export function RealPhoto() {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Photo A. Five separate fingers, matching gold hoop earrings, a shadow on one side of the face, and a jacket logo that clearly reads ARC.">
      <defs>
        <linearGradient id="real-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec6ea" />
          <stop offset="1" stopColor="#c4a27a" />
        </linearGradient>
      </defs>
      <rect width="320" height="210" fill="url(#real-sky)" />
      <rect x="0" y="120" width="54" height="90" fill="#2c3d4e" />
      <rect x="250" y="96" width="70" height="114" fill="#243444" />
      <g>
        <path d="M78 92 Q118 78 168 98 L176 200 H70 Z" fill="#1f5f78" />
        <text x="122" y="132" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" letterSpacing="2" fill="#f4efe4">
          ARC
        </text>
        <ellipse cx="116" cy="72" rx="34" ry="40" fill="#e0b394" />
        <ellipse cx="132" cy="76" rx="14" ry="24" fill="#c48968" opacity="0.5" />
        <ellipse cx="80" cy="74" rx="7" ry="11" fill="#e0b394" />
        <ellipse cx="150" cy="74" rx="7" ry="11" fill="#d7a888" />
        <circle cx="74" cy="84" r="6" fill="none" stroke="#d6a84f" strokeWidth="3" />
        <circle cx="156" cy="84" r="6" fill="none" stroke="#d6a84f" strokeWidth="3" />
        <ellipse cx="104" cy="68" rx="3.5" ry="2.6" fill="#2b211c" />
        <ellipse cx="126" cy="70" rx="3.5" ry="2.6" fill="#2b211c" />
        <path d="M106 88 Q116 94 128 86" fill="none" stroke="#8a5344" strokeWidth="2" />
      </g>
      <g>
        <rect x="196" y="128" width="46" height="28" rx="10" fill="#e0b394" />
        {[0, 1, 2, 3, 4].map((finger) => (
          <rect
            key={finger}
            x={188 + finger * 16}
            y={finger === 0 ? 108 : 96}
            width="14"
            height={finger === 0 ? 36 : 46}
            rx="7"
            fill="#e0b394"
            stroke="#c48968"
            strokeWidth="1"
          />
        ))}
      </g>
    </svg>
  );
}

export function AiPhoto() {
  return (
    <svg viewBox="0 0 320 210" role="img" aria-label="Photo B. Six fingers, one hoop earring and one square stud, airbrushed skin, and a jacket logo whose letters are warped.">
      <defs>
        <radialGradient id="ai-bg" cx="50%" cy="40%" r="75%">
          <stop offset="0" stopColor="#f7d7e4" />
          <stop offset="1" stopColor="#8ea4d6" />
        </radialGradient>
        <linearGradient id="plastic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe7d8" />
          <stop offset="1" stopColor="#f3c2a4" />
        </linearGradient>
      </defs>
      <rect width="320" height="210" fill="url(#ai-bg)" />
      <path d="M70 96 Q120 74 176 96 L186 200 H62 Z" fill="#5b4a86" />
      <text x="96" y="138" fontFamily="Georgia, serif" fontSize="26" fill="#fff6ea" transform="rotate(-18 96 138)">
        A
      </text>
      <text x="118" y="148" fontFamily="Georgia, serif" fontSize="13" fill="#fff6ea" transform="rotate(16 118 148)">
        R
      </text>
      <text x="136" y="124" fontFamily="Georgia, serif" fontSize="22" fill="#fff6ea" transform="rotate(-8 136 124)">
        C
      </text>
      <ellipse cx="118" cy="70" rx="36" ry="40" fill="url(#plastic)" />
      <ellipse cx="118" cy="58" rx="18" ry="12" fill="#fff" opacity="0.6" />
      <ellipse cx="80" cy="72" rx="7" ry="11" fill="#f3c2a4" />
      <ellipse cx="156" cy="72" rx="7" ry="11" fill="#f3c2a4" />
      <circle cx="74" cy="82" r="6.5" fill="none" stroke="#f5d78e" strokeWidth="3" />
      <rect x="152" y="76" width="10" height="10" fill="#9ad7ff" />
      <ellipse cx="106" cy="66" rx="4" ry="2.8" fill="#3a2a28" />
      <ellipse cx="132" cy="66" rx="4" ry="2.8" fill="#3a2a28" />
      <path d="M108 86 H130" stroke="#c48b86" strokeWidth="2" />
      <rect x="198" y="132" width="52" height="26" rx="10" fill="#f3c2a4" />
      {[0, 1, 2, 3, 4, 5].map((finger) => (
        <rect
          key={finger}
          x={186 + finger * 14}
          y={finger === 5 ? 104 : finger === 0 ? 112 : 98}
          width={finger === 5 ? 10 : 13}
          height={finger === 0 ? 32 : 44}
          rx="6"
          fill="#f3c2a4"
          stroke="#e7b093"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
