import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { createUnplugin } from 'unplugin';

interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

async function getImageDataFromFile(originalPath: string): Promise<ImageData> {
  const stream = fs.createReadStream(originalPath);
  if (originalPath.endsWith('.png')) {
    const result = await stream
      .pipe(sharp().png())
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      width: result.info.width,
      height: result.info.height,
      data: result.data as unknown as Uint8ClampedArray,
    };
  }
  if (originalPath.endsWith('.webp')) {
    const result = await stream
      .pipe(sharp().webp())
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      width: result.info.width,
      height: result.info.height,
      data: result.data as unknown as Uint8ClampedArray,
    };
  }
  if (originalPath.endsWith('.jpg')) {
    const result = await stream
      .pipe(sharp().jpeg())
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      width: result.info.width,
      height: result.info.height,
      data: result.data as unknown as Uint8ClampedArray,
    };
  }
  throw new Error('unsupported format');
}

const TARGET_PATH = /\.(png|jpg|webp)\?imitari/;

export const imitari = createUnplugin(() => {
  return {
    name: 'imitari',
    resolveId(id, importer) {
      if (TARGET_PATH.test(id) && importer) {
        return path.join(path.dirname(importer), id);
      }
      return null;
    },
    async load(id) {
      if (id.startsWith('\0')) {
        return null;
      }
      const { dir, name, ext } = path.parse(id);
      const originalPath = `${dir}/${name}${ext.split('?')[0]}`;
      const imageData = await getImageDataFromFile(originalPath);
      return `
  export const width = ${JSON.stringify(imageData.width)};
  export const height = ${JSON.stringify(imageData.height)};
  export { default as source } from ${JSON.stringify(originalPath)};
  `;
    },
    vite: {
      enforce: 'pre',
    },
  };
});
