/**
 * Image helpers for product/grid imagery.
 *
 * Supabase Storage supports on-the-fly image transformations via the
 * /render/image/public/ endpoint (width, height, quality, resize).
 * We use it to serve sharp, properly-sized images for product cards
 * instead of letting the browser downscale full-resolution originals
 * (which often looks soft / blurry).
 *
 * For non-Supabase URLs (e.g. Unsplash) we just return the URL unchanged
 * — Unsplash already serves optimized sizes via its own query params on
 * the source side.
 */

const SUPABASE_PUBLIC_OBJECT = "/storage/v1/object/public/";
const SUPABASE_PUBLIC_RENDER = "/storage/v1/render/image/public/";

interface TransformOpts {
  width: number;
  quality?: number; // 20 - 100
  resize?: "cover" | "contain" | "fill";
}

export function transformProductImage(
  url: string | null | undefined,
  { width, quality = 80, resize = "cover" }: TransformOpts
): string | undefined {
  if (!url) return undefined;

  // Only rewrite Supabase storage public-object URLs.
  if (url.includes(SUPABASE_PUBLIC_OBJECT)) {
    const rendered = url.replace(SUPABASE_PUBLIC_OBJECT, SUPABASE_PUBLIC_RENDER);
    const sep = rendered.includes("?") ? "&" : "?";
    return `${rendered}${sep}width=${width}&quality=${quality}&resize=${resize}`;
  }

  return url;
}

/**
 * Build a srcSet string at 1x and 2x for retina displays.
 */
export function productImageSrcSet(
  url: string | null | undefined,
  baseWidth: number,
  opts: Omit<TransformOpts, "width"> = {}
): string | undefined {
  if (!url) return undefined;
  const x1 = transformProductImage(url, { ...opts, width: baseWidth });
  const x2 = transformProductImage(url, { ...opts, width: baseWidth * 2 });
  if (!x1 || !x2) return undefined;
  // If the URL was unchanged (non-Supabase), srcSet is unnecessary.
  if (x1 === x2) return undefined;
  return `${x1} 1x, ${x2} 2x`;
}
