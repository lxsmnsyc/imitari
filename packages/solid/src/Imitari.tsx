import type {
  ImitariImageSource,
  ImitariImageVariant,
  ImitariTransformer,
} from 'imitari';
import {
  createImageVariants,
  mergeImageVariantsByType,
  mergeImageVariantsToSrcSet,
} from 'imitari';
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

export interface ImitariProps<T> {
  src: ImitariImageSource<T>;
  alt: string;
  transformer?: ImitariTransformer<T>;

  onLoad?: () => void;
  children: (visible: () => boolean, onLoad: () => void) => JSX.Element;

  crossOrigin?: JSX.HTMLCrossorigin | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  decoding?: 'sync' | 'async' | 'auto' | undefined;
}

interface ImitariSourcesProps<T> extends ImitariProps<T> {
  variants: ImitariImageVariant[];
}

function ImitariSources<T>(props: ImitariSourcesProps<T>): JSX.Element {
  const mergedVariants = createMemo(() => {
    const types = mergeImageVariantsByType(props.variants);

    const values: [type: string, srcset: string][] = [];

    for (const [key, variants] of types) {
      values.push([key, mergeImageVariantsToSrcSet(variants)]);
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
                variants={createImageVariants(props.src, cb())}
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
