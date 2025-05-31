import type { ImitariFile, ImitariFormat, ImitariMIME } from './types';

const MIME_TO_FORMAT: Record<ImitariMIME, ImitariFormat> = {
  'image/apng': 'apng',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

export function getFormatFromMIME(mime: ImitariMIME): ImitariFormat {
  return MIME_TO_FORMAT[mime];
}

const FORMAT_TO_MIME: Record<ImitariFormat, ImitariMIME> = {
  apng: 'image/apng',
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export function getMIMEFromFormat(format: ImitariFormat): ImitariMIME {
  return FORMAT_TO_MIME[format];
}

const FILE_TO_FORMAT: Record<ImitariFile, ImitariFormat> = {
  apng: 'apng',
  avif: 'avif',
  gif: 'gif',
  jfif: 'jpeg',
  jpeg: 'jpeg',
  jpg: 'jpeg',
  pjp: 'jpeg',
  pjpeg: 'jpeg',
  png: 'png',
  svg: 'svg',
  webp: 'webp',
};

export function getFormatFromFile(file: ImitariFile): ImitariFormat {
  return FILE_TO_FORMAT[file];
}

const FORMAT_TO_FILES: Record<ImitariFormat, ImitariFile[]> = {
  apng: ['apng', 'png'],
  avif: ['avif'],
  gif: ['gif'],
  jpeg: ['jfif', 'jpeg', 'jpg', 'pjp', 'pjpeg'],
  png: ['png'],
  svg: ['svg'],
  webp: ['webp'],
};

export function getFilesFromFormat(format: ImitariFormat): ImitariFile[] {
  return FORMAT_TO_FILES[format];
}

const FORMAT_TO_OUTPUT: Record<ImitariFormat, ImitariFile> = {
  apng: 'apng',
  avif: 'avif',
  gif: 'gif',
  jpeg: 'jpg',
  png: 'png',
  svg: 'svg',
  webp: 'webp',
};

export function getOutputFileFromFormat(format: ImitariFormat): ImitariFile {
  return FORMAT_TO_OUTPUT[format];
}
