import type { ImitariFile, ImitariFormat, ImitariImageVariant } from 'imitari';
import {
  getFilesFromFormat,
  getFormatFromFile,
  getMIMEFromFormat,
} from 'imitari';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { type UnpluginOptions, createUnplugin } from 'unplugin';

interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

async function getImageDataFromPNG(stream: fs.ReadStream): Promise<ImageData> {
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

const DEFAULT_INPUT: ImitariFormat[] = ['png', 'jpeg', 'webp'];
const DEFAULT_OUTPUT: ImitariFormat[] = ['png', 'jpeg', 'webp'];
const DEFAULT_QUALITY = 0.8;

export interface ImitariOptions {
  local?: {
    sizes: number[];
    input?: ImitariFormat[];
    output?: ImitariFormat[];
    quality: number;
  };
  remote?: {
    transformURL(url: string): ImitariImageVariant | ImitariImageVariant[];
  };
}

function getValidFileExtensions(formats: ImitariFormat[]): Set<string> {
  const result = new Set<ImitariFile>();
  for (const format of formats) {
    for (const file of getFilesFromFormat(format)) {
      result.add(file);
    }
  }
  return result;
}

function getOutputFileExtensions(formats: ImitariFormat[]): ImitariFile[] {
  const result: ImitariFile[] = [];
  for (const format of formats) {
    result.push(getOu);
  }
}

function isValidFileExtension(
  extensions: Set<string>,
  target: string,
): target is ImitariFile {
  return extensions.has(target);
}

async function getImageSource(imagePath: string): Promise<string> {
  // TODO add format variation
  const imageData = await getImageDataFromFile(imagePath);
  return `
export const width = ${JSON.stringify(imageData.width)};
export const height = ${JSON.stringify(imageData.height)};
export { default as source } from ${JSON.stringify(imagePath)};
  `;
}

function getImageTransformer(
  imagePath: string,
  outputTypes: string[],
  sizes: number[],
): string {
  let imported = '';
  let exported = '';

  for (let i = 0, len = sizes.length; i < len; i++) {
    imported +=
      'import variant' +
      i +
      ' from ' +
      JSON.stringify(imagePath + '?imitari-variant-' + sizes[i]) +
      ';\n';
    exported += 'variant' + 'i' + ',';
  }

  return (
    imported +
    'const variants = [' +
    exported +
    '];' +
    'export default { transform() { return variants; }};'
  );
}

function getImageVariant(
  imagePath: string,
  file: ImitariFile,
  variant: number,
): string {
  // TODO add format variation
  return `import source from ${JSON.stringify(imagePath + '?imitari-image-' + variant)};
export default {
  width: ${variant},
  type: '${getMIMEFromFormat(getFormatFromFile(file))}',
  path: source,
};`;
}

const LOCAL_PATH =
  /\?imitari(-(source|transformer|(variant-[0-9]+)|(image-[0-9]+)))?/;
const REMOTE_PATH = /^imitari\:/;
const VARIANT_MATCHER = /imitari-variant-[0-9]+/;

function getVariantSize(condition: string): number | undefined {
  const results = condition.match(VARIANT_MATCHER);
  if (results) {
    const item = results[0];
  }
  return undefined;
}

export const imitari = createUnplugin((options: ImitariOptions) => {
  const remotePlugin: UnpluginOptions = {
    name: 'imitari/remote',
  };
  if (!options.local) {
    return remotePlugin;
  }
  const inputFormat = options.local.input ?? DEFAULT_INPUT;
  const outputFormat = options.local.output ?? DEFAULT_OUTPUT;
  const quality = options.local.quality ?? DEFAULT_QUALITY;
  const sizes = options.local.sizes;

  const validInputFileExtensions = getValidFileExtensions(inputFormat);

  return [
    {
      name: 'imitari/local',
      resolveId(id, importer) {
        if (LOCAL_PATH.test(id) && importer) {
          return path.join(path.dirname(importer), id);
        }
        return null;
      },
      async load(id) {
        if (id.startsWith('\0')) {
          return null;
        }
        const { dir, name, ext } = path.parse(id);
        const [actualExtension, condition] = ext.split('?');
        // Check if extension is valid
        if (!isValidFileExtension(validInputFileExtensions, actualExtension)) {
          return null;
        }
        const originalPath = `${dir}/${name}${actualExtension}`;
        // Get the true source
        if (condition.startsWith('imitari-source')) {
          return await getImageSource(originalPath);
        }
        // Gets the transformer
        if (condition.startsWith('imitari-transformer')) {
          return getImageTransformer(originalPath, sizes);
        }
        if (condition.startsWith('imitari-variant-')) {
          const size = getVariantSize(condition);
          if (size) {
            return getImageVariant(originalPath, actualExtension, size);
          }
          throw new Error('Unexpected size');
        }
        if (condition.startsWith('imitari')) {
        }
        return null;
      },
      vite: {
        enforce: 'pre',
      },
    },
  ];
});
