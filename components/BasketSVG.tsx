export default function BasketSVG() {
  return (
    <svg
      viewBox="0 0 160 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full drop-shadow-md"
      aria-hidden="true"
    >
      {/* Handle */}
      <path
        d="M52 32 Q80 4 108 32"
        stroke="#C4903A"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Basket body */}
      <path
        d="M14 36 Q18 98 80 104 Q142 98 146 36 Z"
        fill="#DEB887"
      />
      {/* Weave horizontals */}
      <path d="M16 52 Q80 58 144 52" stroke="#B8751A" strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d="M18 67 Q80 74 142 67" stroke="#B8751A" strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d="M22 82 Q80 90 138 82" stroke="#B8751A" strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d="M28 96 Q80 102 132 96" stroke="#B8751A" strokeWidth="1.8" fill="none" opacity="0.4" />
      {/* Weave verticals */}
      <path d="M38 36 Q35 70 37 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M55 36 Q53 70 54 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M72 36 Q71 70 71 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M89 36 Q89 70 89 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M106 36 Q107 70 106 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      <path d="M122 36 Q124 70 121 104" stroke="#B8751A" strokeWidth="1.4" fill="none" opacity="0.45" />
      {/* Basket rim (ellipse opening) */}
      <ellipse cx="80" cy="36" rx="66" ry="11" fill="#E8C88A" stroke="#C4903A" strokeWidth="3" />
    </svg>
  );
}
