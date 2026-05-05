import type { NameStyle } from "@/lib/types";

export function NameDisplay({
  name,
  style,
  accent,
}: {
  name: string;
  style: NameStyle;
  accent: string;
}) {
  if (style === "brackets") {
    return (
      <div className="flex flex-wrap items-center">
        {Array.from(name).map((ch, i) =>
          ch === " " ? (
            <span key={i} className="inline-block w-2" />
          ) : (
            <span
              key={i}
              className="inline-grid place-items-center h-7 w-6 sm:h-8 sm:w-7 mx-[1px] rounded-[3px] border font-mono text-[15px] sm:text-[17px] font-bold"
              style={{
                borderColor: `${accent}55`,
                background: `${accent}10`,
                color: "#fff",
              }}
            >
              {ch.toUpperCase()}
            </span>
          )
        )}
      </div>
    );
  }

  if (style === "neon") {
    return (
      <h2
        className="font-cyber text-3xl sm:text-4xl font-black uppercase leading-none"
        style={{
          color: "#fff",
          textShadow: `0 0 8px ${accent}, 0 0 24px ${accent}, 0 0 48px ${accent}`,
          letterSpacing: "0.02em",
        }}
      >
        {name}
      </h2>
    );
  }

  if (style === "glitch") {
    return (
      <div className="relative font-cyber text-3xl sm:text-4xl font-black uppercase leading-none text-white">
        {name}
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse"
          style={{ color: accent, transform: "translate(2px,-1px)", mixBlendMode: "screen" }}
        >
          {name}
        </span>
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ color: "#0ff", transform: "translate(-2px,1px)", mixBlendMode: "screen", opacity: 0.6 }}
        >
          {name}
        </span>
      </div>
    );
  }

  if (style === "mono") {
    return (
      <h2 className="font-mono text-2xl sm:text-3xl font-bold lowercase tracking-tight text-white">
        {name.toLowerCase()}
        <span style={{ color: accent }}>_</span>
      </h2>
    );
  }

  if (style === "gradient") {
    return (
      <h2
        className="font-cyber text-3xl sm:text-4xl font-black uppercase leading-none bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(135deg, #fff 0%, ${accent} 60%, #fff 100%)`,
        }}
      >
        {name}
      </h2>
    );
  }

  if (style === "outline") {
    return (
      <h2
        className="font-cyber text-3xl sm:text-4xl font-black uppercase leading-none"
        style={{
          color: "transparent",
          WebkitTextStroke: `1.5px ${accent}`,
        } as React.CSSProperties}
      >
        {name}
      </h2>
    );
  }

  // minimal
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
      {name}
    </h2>
  );
}
