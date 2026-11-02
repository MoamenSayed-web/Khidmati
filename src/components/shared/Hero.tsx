import type { ReactNode } from "react"

export function Hero({
  title,
  text,
  children,
  compact = false,
}: {
  title: string
  text: string
  children?: ReactNode
  compact?: boolean
}) {
  return (
    <section className={`hero ${compact ? "hero-compact" : ""}`}>
      <div className="hero-content">
        <div className="hero-title">{title}</div>
        <p>{text}</p>
        {children}
      </div>
      <div className="hero-waves" aria-hidden="true">
        {[
          {
            className: "wave-back",
            path: "M0 74C180 28 360 120 540 78C720 36 900 118 1080 78C1260 38 1350 56 1440 74C1620 28 1800 120 1980 78C2160 36 2340 118 2520 78C2700 38 2790 56 2880 74V180H0Z",
          },
          {
            className: "wave-middle",
            path: "M0 92C240 135 420 35 720 88C1020 141 1200 42 1440 92C1680 135 1860 35 2160 88C2460 141 2640 42 2880 92V180H0Z",
          },
          {
            className: "wave-front",
            path: "M0 88C210 48 420 128 720 92C1020 56 1230 122 1440 88C1650 48 1860 128 2160 92C2460 56 2670 122 2880 88V180H0Z",
          },
        ].map(({ className, path }) => (
          <svg
            key={className}
            className={`hero-wave-layer ${className}`}
            viewBox="0 0 2880 180"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d={path} />
          </svg>
        ))}
      </div>
    </section>
  )
}
