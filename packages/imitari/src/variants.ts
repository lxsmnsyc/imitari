import type {
  ImitariImageSource,
  ImitariImageVariant,
  ImitariTransformer,
} from './types';

function ensureArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

export function createImageVariants<T>(
  source: ImitariImageSource<T>,
  transformer: ImitariTransformer<T>,
): ImitariImageVariant[] {
  return ensureArray(transformer.transform(source));
}

function variantToSrcSetPart(variant: ImitariImageVariant): string {
  return variant.path + ' ' + variant.width + 'w';
}

export function mergeImageVariantsToSrcSet(
  variants: ImitariImageVariant[],
): string {
  let result = variantToSrcSetPart(variants[0]);

  for (let i = 1, len = variants.length; i < len; i++) {
    result += ',' + variantToSrcSetPart(variants[i]);
  }

  return result;
}

export function mergeImageVariantsByType(
  variants: ImitariImageVariant[],
): Map<string, ImitariImageVariant[]> {
  const map = new Map<string, ImitariImageVariant[]>();

  for (let i = 0, len = variants.length; i < len; i++) {
    const current = variants[i];

    const arr = map.get(current.type) || [];
    arr.push(current);
    map.set(current.type, arr);
  }

  return map;
}
