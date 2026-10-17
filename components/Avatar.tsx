import Image from "next/image";
import { cn } from "@/components/ui";

export function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({
  name,
  email,
  image,
  size = 32,
  className,
}: {
  name?: string | null;
  email: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        // Avatars come from Google or our own S3-backed route; skip the optimizer.
        unoptimized
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white/20", className)}
        style={style}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-blue-600 font-semibold text-white ring-2 ring-white/20",
        className,
      )}
      style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.36)) }}
    >
      {initials(name, email)}
    </span>
  );
}
