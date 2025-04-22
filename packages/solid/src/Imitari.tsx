import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { ClientOnly } from './client-only';
import { createLazyRender } from './create-lazy-render';
import {
  BLOCKER_STYLE,
  IMAGE_CONTAINER,
  IMAGE_STYLE,
  getAspectRatioBoxStyle,
  getEmptyImageURL,
} from './utils';

export interface ImitariProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  onLoad?: () => void;
  children: (visible: () => boolean, onLoad: () => void) => JSX.Element;

  crossOrigin?: JSX.HTMLCrossorigin | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  decoding?: 'sync' | 'async' | 'auto' | undefined;
}

export function Imitari(props: ImitariProps): JSX.Element {
  const [showPlaceholder, setShowPlaceholder] = createSignal(true);
  const laze = createLazyRender<HTMLDivElement>();
  const [defer, setDefer] = createSignal(true);

  function onPlaceholderLoad() {
    setDefer(false);
  }

  return (
    <div ref={laze.ref} data-imitari="image-container" style={IMAGE_CONTAINER}>
      <div
        data-imitari="aspect-ratio"
        style={getAspectRatioBoxStyle({
          width: props.width,
          height: props.height,
        })}
      >
        <ClientOnly
          fallback={
            <noscript>
              <img
                data-imitari="image"
                src={props.src}
                alt={props.alt}
                style={IMAGE_STYLE}
                crossOrigin={props.crossOrigin}
                fetchpriority={props.fetchPriority}
                decoding={props.decoding}
              />
            </noscript>
          }
        >
          {laze.visible && (
            <>
              <img
                data-imitari="image"
                src={
                  defer()
                    ? getEmptyImageURL({
                        width: props.width,
                        height: props.height,
                      })
                    : props.src
                }
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
              {props.children(showPlaceholder, onPlaceholderLoad)}
            </>
          )}
        </ClientOnly>
      </div>
      <div style={BLOCKER_STYLE} />
    </div>
  );
}
