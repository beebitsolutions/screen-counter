/**
 * Fixture E.5 — modalize-image.tsx (kebab-case with "modal" embedded in
 * a non-suffix word).
 * Expected: NOT counted.
 * The last word of the basename is "image", not "modal" — the
 * normalisation matches the FINAL segment only, so "modalize" embedded
 * inside the first segment never triggers a name-suffix signal. This
 * pins the regression: do not accidentally re-introduce substring
 * matching when adding kebab-case support.
 */
'use client';

import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export default function ModalizeImage({ src, alt, width = 320, height = 200 }: Props) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-muted">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="block h-auto w-full"
        unoptimized
      />
      <figcaption className="px-3 py-2 text-xs text-muted-foreground">{alt}</figcaption>
    </figure>
  );
}
