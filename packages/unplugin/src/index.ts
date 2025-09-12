import type { ImitariFile, ImitariFormat, ImitariImageVariant } from 'imitari';
import {
  getFilesFromFormat,
  getMIMEFromFormat,
  getOutputFileFromFormat,
} from 'imitari';
import path from 'node:path';
import { type UnpluginOptions, createUnplugin } from 'unplugin';
import { outputFile } from './fs';
import { getImageData, transformImage } from './transformers';
import xxHash32 from './xxhash';

const DEFAULT_INPUT: ImitariFormat[] = ['png', 'jpeg', 'webp'];
const DEFAULT_OUTPUT: ImitariFormat[] = ['png', 'jpeg', 'webp'];
const DEFAULT_QUALITY = 0.8;

export interface ImitariOptions {
  local?: {
    sizes: number[];
    input?: ImitariFormat[];
    output?: ImitariFormat[];
    quality: number;
    publicPath?: string;
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

function isValidFileExtension(
  extensions: Set<string>,
  target: string,
): target is ImitariFile {
  return extensions.has(target);
}

async function getImageSource(
  imagePath: string,
  relativePath: string,
): Promise<string> {
  // TODO add format variation
  const imageData = await getImageData(imagePath);
  return `
import source from ${JSON.stringify(relativePath)};
export default {
  width: ${JSON.stringify(imageData.width)},
  height: ${JSON.stringify(imageData.height)},
  source,
};
`;
}

function getImageTransformer(
  imagePath: string,
  outputTypes: string[],
  sizes: number[],
): string {
  let imported = '';
  let exported = '';

  for (const format of outputTypes) {
    for (const size of sizes) {
      const variantName = 'variant_' + format + '_' + size;
      const importPath = JSON.stringify(
        imagePath + '?imitari-' + format + '-' + size,
      );
      imported += 'import ' + variantName + ' from ' + importPath + ';\n';
      exported += variantName + ',';
    }
  }

  return (
    imported +
    'const variants = [' +
    exported +
    '];\n' +
    'export default { transform() { return variants; }};'
  );
}

function getImageVariant(
  imagePath: string,
  target: ImitariFormat,
  size: number,
): string {
  return `import source from ${JSON.stringify(imagePath + '?imitari-raw-' + target + '-' + size)};
export default {
  width: ${size},
  type: '${getMIMEFromFormat(target)}',
  path: source,
};`;
}

function getImageEntryPoint(imagePath: string): string {
  return `import src from ${JSON.stringify(imagePath + '?imitari-source')};
import transformer from ${JSON.stringify(imagePath + '?imitari-transformer')};

export default { src, transformer };
`;
}

const LOCAL_PATH = /\?imitari(-[a-z]+(-[0-9]+)?)?/;
// const REMOTE_PATH = /^imitari\:/;

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
  const publicPath = options.local.publicPath ?? 'dist';

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
        const [actualExtension, condition] = ext.substring(1).split('?');
        // Check if extension is valid
        if (!isValidFileExtension(validInputFileExtensions, actualExtension)) {
          return null;
        }
        if (!condition) {
          return null;
        }
        const originalPath = `${dir}/${name}.${actualExtension}`;
        const relativePath = `./${name}.${actualExtension}`;
        // Get the true source
        if (condition.startsWith('imitari-source')) {
          return await getImageSource(originalPath, relativePath);
        }
        // Get the transformer file
        if (condition.startsWith('imitari-transformer')) {
          return getImageTransformer(relativePath, outputFormat, sizes);
        }
        // Image transformer variant
        if (condition.startsWith('imitari-raw')) {
          const [, , format, size] = condition.split('-');
          const hash = xxHash32(originalPath).toString(16);
          const filename = `imitari-${hash}-${size}.${getOutputFileFromFormat(format as ImitariFormat)}`;
          const image = transformImage(
            originalPath,
            format as ImitariFormat,
            +size,
            quality,
          );
          const buffer = await image.toBuffer();
          const basePath = path.join('.imitari', filename);
          const targetPath = path.join(publicPath, basePath);
          await outputFile(targetPath, buffer);
          return `export default "/${basePath}"`;
        }
        // Image transformer variant
        if (condition.startsWith('imitari-')) {
          const [, format, size] = condition.split('-');

          return getImageVariant(relativePath, format as ImitariFormat, +size);
        }
        if (condition.startsWith('imitari')) {
          return getImageEntryPoint(relativePath);
        }
        return null;
      },
      // async writeBundle() {
      //   await Promise.all(
      //     Array.from(inputs.entries()).map(async ([target, data]) => {

      //       // TODO Output directory
      //       await fs.writeFile(path.join(outputPath, target), buffer);
      //     }),
      //   );
      // },
      vite: {
        enforce: 'pre',
      },
    },
  ];
});
