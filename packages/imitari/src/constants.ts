import type { ImitariFile, ImitariFormat, ImitariMIME } from './types';

const MIME_TO_FORMAT: Record<ImitariMIME, ImitariFormat> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
};

export function getFormatFromMIME(mime: ImitariMIME): ImitariFormat {
  return MIME_TO_FORMAT[mime];
}

const FORMAT_TO_MIME: Record<ImitariFormat, ImitariMIME> = {
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  tiff: 'image/tiff',
};

export function getMIMEFromFormat(format: ImitariFormat): ImitariMIME {
  return FORMAT_TO_MIME[format];
}

const FILE_TO_FORMAT: Record<ImitariFile, ImitariFormat> = {
  avif: 'avif',
  jfif: 'jpeg',
  jpeg: 'jpeg',
  jpg: 'jpeg',
  pjp: 'jpeg',
  pjpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  tif: 'tiff',
  tiff: 'tiff',
};

export function getFormatFromFile(file: ImitariFile): ImitariFormat {
  return FILE_TO_FORMAT[file];
}

const FORMAT_TO_FILES: Record<ImitariFormat, ImitariFile[]> = {
  avif: ['avif'],
  jpeg: ['jfif', 'jpeg', 'jpg', 'pjp', 'pjpeg'],
  png: ['png'],
  webp: ['webp'],
  tiff: ['tif', 'tiff'],
};

export function getFilesFromFormat(format: ImitariFormat): ImitariFile[] {
  return FORMAT_TO_FILES[format];
}

const FORMAT_TO_OUTPUT: Record<ImitariFormat, ImitariFile> = {
  avif: 'avif',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  tiff: 'tiff'
};

export function getOutputFileFromFormat(format: ImitariFormat): ImitariFile {
  return FORMAT_TO_OUTPUT[format];
}
