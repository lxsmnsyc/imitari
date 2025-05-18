import type { JSX } from 'solid-js';
import { For, Show, createMemo, createSignal } from 'solid-js';
import { ClientOnly } from './client-only';
import { createLazyRender } from './create-lazy-render';
import {
  BLOCKER_STYLE,
  IMAGE_CONTAINER,
  IMAGE_STYLE,
  getAspectRatioBoxStyle,
  getEmptyImageURL,
} from './utils';

export type ImitariMIME =
  | 'image/apng'
  | 'image/avif'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/webp';

export interface ImitariImageVariant {
  path: string;
  width: number;
  type: ImitariMIME;
}

export interface ImitariImageSource {
  source: ImitariImageVariant | ImitariImageVariant[];
  width: number;
  height: number;
}

export interface Transformer {
  transform: (
    source: ImitariImageSource,
    data: ImitariImageVariant,
  ) => ImitariImageVariant | ImitariImageVariant[];
}

export interface TransformerWithOptions<T> {
  transform: (
    source: ImitariImageSource,
    data: ImitariImageVariant,
    options: T,
  ) => ImitariImageVariant | ImitariImageVariant[];
  options: T;
}

function ensureArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function transformVariant<T>(
  source: ImitariImageSource,
  transformer: Transformer | TransformerWithOptions<T>,
  variant: ImitariImageVariant,
): ImitariImageVariant[] {
  if ('options' in transformer) {
    return ensureArray(
      transformer.transform(source, variant, transformer.options),
    );
  }
  return ensureArray(transformer.transform(source, variant));
}

function transformVariants<T>(
  source: ImitariImageSource,
  transformer: Transformer | TransformerWithOptions<T>,
  variants: ImitariImageVariant | ImitariImageVariant[],
): ImitariImageVariant[] {
  if (Array.isArray(variants)) {
    const result: ImitariImageVariant[] = [];
    for (let i = 0, len = variants.length; i < len; i++) {
      result.push.apply(
        result,
        transformVariant(source, transformer, variants[i]),
      );
    }
    return result;
  }
  return ensureArray(transformVariant(source, transformer, variants));
}

function variantToSrcSetPart(variant: ImitariImageVariant): string {
  return variant.path + ' ' + variant.width + 'w';
}

function mergeVariants(variants: ImitariImageVariant[]): string {
  let result = variantToSrcSetPart(variants[0]);

  for (let i = 1, len = variants.length; i < len; i++) {
    result += ',' + variantToSrcSetPart(variants[i]);
  }

  return result;
}

function mergeVariantsByType(
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

export interface ImitariBaseProps {
  src: ImitariImageSource;
  alt: string;

  onLoad?: () => void;
  children: (visible: () => boolean, onLoad: () => void) => JSX.Element;

  crossOrigin?: JSX.HTMLCrossorigin | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  decoding?: 'sync' | 'async' | 'auto' | undefined;
}

export interface ImitariProps<T> extends ImitariBaseProps {
  transformer?: Transformer | TransformerWithOptions<T>;
}

function ImitariSources<T>(props: ImitariProps<T>): JSX.Element {
  const variants = createMemo(() => {
    if (props.transformer) {
      return transformVariants(props.src, props.transformer, props.src.source);
    }
    return ensureArray(props.src.source);
  });

  const mergedVariants = createMemo(() => {
    const types = mergeVariantsByType(variants());

    const values: [type: string, srcset: string][] = [];

    for (const [key, variants] of types) {
      values.push([key, mergeVariants(variants)]);
    }

    return values;
  });

  return (
    <For each={mergedVariants()}>
      {([type, srcset]) => <source type={type} srcset={srcset} />}
    </For>
  );
}

export function Imitari<T>(props: ImitariProps<T>): JSX.Element {
  const [showPlaceholder, setShowPlaceholder] = createSignal(true);
  const laze = createLazyRender<HTMLDivElement>();
  const [defer, setDefer] = createSignal(true);

  function onPlaceholderLoad() {
    setDefer(false);
  }

  const width = createMemo(() => props.src.width);
  const height = createMemo(() => props.src.height);

  return (
    <div ref={laze.ref} data-imitari="image-container" style={IMAGE_CONTAINER}>
      <div
        data-imitari="aspect-ratio"
        style={getAspectRatioBoxStyle({
          width: width(),
          height: height(),
        })}
      >
        <picture>
          <ImitariSources {...props} />
          <ClientOnly
            fallback={
              <img
                data-imitari="image"
                alt={props.alt}
                style={IMAGE_STYLE}
                crossOrigin={props.crossOrigin}
                fetchpriority={props.fetchPriority}
                decoding={props.decoding}
              />
            }
          >
            <Show when={laze.visible}>
              <img
                data-imitari="image"
                src={getEmptyImageURL({
                  width: width(),
                  height: height(),
                })}
                alt={props.alt}
                onLoad={() => {
                  if (!defer()) {
                    setShowPlaceholder(false);
                    props.onLoad?.();
                  }
                }}
                style={{
                  ...IMAGE_STYLE,
                  opacity: showPlaceholder() ? 0 : 1,
                }}
                crossOrigin={props.crossOrigin}
                fetchpriority={props.fetchPriority}
                decoding={props.decoding}
              />
            </Show>
            {props.children(showPlaceholder, onPlaceholderLoad)}
          </ClientOnly>
        </picture>
      </div>
      <div style={BLOCKER_STYLE} />
    </div>
  );
}
