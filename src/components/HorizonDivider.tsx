export default function HorizonDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-16 sm:h-20">
        <div className="absolute inset-0 flex animate-waveDrift">
          <Wave />
          <Wave />
        </div>
      </div>
    </div>
  );
}

function Wave() {
  return (
    <svg
      className="h-16 sm:h-20 w-[1200px] shrink-0"
      viewBox="0 0 1200 80"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 44 C 100 28, 200 60, 300 44 S 500 28, 600 44 S 800 60, 900 44 S 1100 28, 1200 44"
        stroke="rgba(79,169,168,0.55)"
        strokeWidth="1.25"
        fill="none"
      />
      <path
        d="M0 54 C 120 40, 240 68, 360 54 S 600 40, 720 54 S 960 68, 1080 54 S 1200 46, 1200 54"
        stroke="rgba(201,161,90,0.45)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M0 62 C 150 52, 300 70, 450 62 S 750 52, 900 62 S 1150 70, 1200 62"
        stroke="rgba(232,220,200,0.25)"
        strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}
