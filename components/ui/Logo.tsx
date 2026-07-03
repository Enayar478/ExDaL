/** Signature typographique ExDaL : « Ex » minéral, « DaL » or (gradient rare). */
export function Logo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl sm:text-7xl",
  } as const;

  return (
    <span
      className={`font-serif font-normal tracking-tight leading-none ${sizes[size]} ${className}`}
      aria-label="ExDaL — Ex Datis Lumen"
    >
      Ex<span className="lum-gradient">DaL</span>
    </span>
  );
}
