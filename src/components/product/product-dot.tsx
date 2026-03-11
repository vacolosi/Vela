import Image from "next/image";

export function ProductDot({
  size = 40,
  imageUrl,
}: {
  size?: number;
  imageUrl?: string | null;
}) {
  const height = size * 1.25;

  if (imageUrl) {
    return (
      <div
        className="rounded-md overflow-hidden bg-cream border border-parchment flex-shrink-0"
        style={{ width: size, height }}
      >
        <Image
          src={imageUrl}
          alt=""
          width={size}
          height={height}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-md bg-cream border border-parchment flex items-center justify-center flex-shrink-0"
      style={{ width: size, height }}
    >
      <div
        className="rounded bg-white/50"
        style={{ width: size * 0.4, height: size * 0.65 }}
      />
    </div>
  );
}
