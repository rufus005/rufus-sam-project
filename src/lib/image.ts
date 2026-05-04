/**
 * Image helpers for product/grid imagery.
 *
 * NOTE: Supabase Storage's image transformation endpoint
 * (`/storage/v1/render/image/public/`) is a paid-tier feature and
 * returns 403 on this project, so we serve the original public-object
 * URL directly. The browser downscales to the displayed size.
 *
 * These helpers are kept as a thin abstraction so we can swap in real
 * transforms later without touching components.
 */

interface TransformOpts {
  width: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

export function transformProductImage(
  url: string | null | undefined,
  _opts: TransformOpts
): string | undefined {
  return url ?? undefined;
}

export function productImageSrcSet(
  _url: string | null | undefined,
  _baseWidth: number,
  _opts: Omit<TransformOpts, "width"> = {}
): string | undefined {
  // No transform available — let the browser use the single src.
  return undefined;
}
