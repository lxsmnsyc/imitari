/**
 * List of supported image types
 *
 * Based on https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types
 */
export type ImitariMIME =
  | 'image/apng'
  | 'image/avif'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/webp';

export type ImitariPNG = 'png';
export type ImitariAPNG = 'apng' | ImitariPNG;
export type ImitariAVIF = 'avif';
export type ImitariGIF = 'gif';
export type ImitariJPEG = 'jpg' | 'jpeg' | 'jfif' | 'pjpeg' | 'pjp';
export type ImitariSVG = 'svg';
export type ImitariWebP = 'webp';

export type ImitariFile =
  | ImitariAPNG
  | ImitariAVIF
  | ImitariGIF
  | ImitariJPEG
  | ImitariPNG
  | ImitariSVG
  | ImitariWebP;

export type ImitariFormat =
  | 'apng'
  | 'avif'
  | 'gif'
  | 'jpeg'
  | 'png'
  | 'svg'
  | 'webp';

/**
 * A variant of an image source. This is used to transform a given source string
 * into a <source> element
 */
export interface ImitariImageVariant {
  path: string;
  width: number;
  type: ImitariMIME;
}

/**
 * An image source
 */
export interface ImitariImageSource<T> {
  source: string;
  width: number;
  height: number;
  options: T;
}

/**
 * Transforms an image source into a set of image variants
 */
export interface ImitariTransformer<T> {
  transform: (
    source: ImitariImageSource<T>,
  ) => ImitariImageVariant | ImitariImageVariant[];
}
