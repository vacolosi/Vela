export function ProductDot({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-md bg-cream border border-parchment flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size * 1.25 }}
    >
      <div
        className="rounded bg-white/50"
        style={{ width: size * 0.4, height: size * 0.65 }}
      />
    </div>
  );
}
