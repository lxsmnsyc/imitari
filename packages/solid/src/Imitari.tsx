import type { JSX } from 'solid-js';
import { For, Show, createMemo, createSignal } from 'solid-js';
import { ClientOnly } from './client-only';
import { createLazyRender } from './create-lazy-render';
import {
  BLOCKER_STYLE,
  IMAGE_CONTAINER,
  IMAGE_STYLE,
  getAspectRatioBoxStyle,
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
  source: string;
  width: number;
  height: number;
}

export interface ImitariTransformer {
  transform: (
    source: ImitariImageSource,
  ) => ImitariImageVariant | ImitariImageVariant[];
}

export interface ImitariTransformerWithOptions<T> {
  transform: (
    source: ImitariImageSource,
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

function createVariants<T>(
  source: ImitariImageSource,
  transformer: ImitariTransformer | ImitariTransformerWithOptions<T>,
): ImitariImageVariant[] {
  if ('options' in transformer) {
    return ensureArray(transformer.transform(source, transformer.options));
  }
  return ensureArray(transformer.transform(source));
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
  transformer?: ImitariTransformer | ImitariTransformerWithOptions<T>;
}

interface ImitariSourcesProps<T> extends ImitariProps<T> {
  variants: ImitariImageVariant[];
}

function ImitariSources<T>(props: ImitariSourcesProps<T>): JSX.Element {
  const mergedVariants = createMemo(() => {
    const types = mergeVariantsByType(props.variants);

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
        <picture style={IMAGE_STYLE}>
          <Show
            when={props.transformer}
            fallback={<source src={props.src.source} />}
          >
            {cb => (
              <ImitariSources
                variants={createVariants(props.src, cb())}
                {...props}
              />
            )}
          </Show>
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
                // src={getEmptyImageURL({
                //   width: width(),
                //   height: height(),
                // })}
                alt={props.alt}
                onLoad={() => {
                  if (!defer()) {
                    setShowPlaceholder(false);
                    props.onLoad?.();
                  }
                }}
                style={{
                  opacity: showPlaceholder() ? 0 : 1,
                }}
                crossOrigin={props.crossOrigin}
                fetchpriority={props.fetchPriority}
                decoding={props.decoding}
              />
            </Show>
          </ClientOnly>
        </picture>
      </div>
      <div style={BLOCKER_STYLE}>
        <ClientOnly>
          <Show when={laze.visible}>
            {props.children(showPlaceholder, onPlaceholderLoad)}
          </Show>
        </ClientOnly>
      </div>
    </div>
  );
}
