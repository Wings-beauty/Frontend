export function ProductSwatch({
  colorHex,
  imageUrl,
  alt = "",
  className = "",
}: {
  colorHex: string;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(140deg, ${colorHex}26 0%, ${colorHex}66 100%)`,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="size-full object-cover"
        />
      ) : (
        <div
          className="size-1/3 min-w-14 max-w-28 aspect-square rounded-full shadow-[0_14px_30px_rgb(58_37_39/0.18)]"
          style={{
            background: `radial-gradient(circle at 32% 28%, #ffffff99 0%, ${colorHex} 46%, ${colorHex}dd 100%)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
