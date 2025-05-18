import {
  Imitari,
  type ImitariImageSource,
  type ImitariImageVariant,
  type ImitariMIME,
} from 'solid-imitari';
import { type JSX, onMount } from 'solid-js';

const BASE_URL = 'https://images.unsplash.com/photo-1417325384643-aac51acc9e5d';

const FORMATS: Record<string, ImitariMIME> = {
  avif: 'image/avif',
  png: 'image/png',
  jpeg: 'image/jpeg',
};

function generateSources(
  url: string,
  sizes: number[],
  formats: string[],
): ImitariImageVariant[] {
  const variants: ImitariImageVariant[] = [];

  for (const size of sizes) {
    for (const format of formats) {
      variants.push({
        path: `${url}?fm=${format}&w=${size}`,
        width: size,
        type: FORMATS[format],
      });
    }
  }

  return variants;
}

const source: ImitariImageSource = {
  source: generateSources(BASE_URL, [400, 800, 1200], ['png', 'jpeg']),
  width: 2448,
  height: 3264,
};

interface PlaceholderProps {
  show: () => void;
}

function Placeholder(props: PlaceholderProps): JSX.Element {
  onMount(() => {
    props.show();
  });

  return <div>hello</div>;
}

export function Example(): JSX.Element {
  return (
    <Imitari src={source} alt="example">
      {(visible, show) => <Placeholder show={show} />}
    </Imitari>
  );
}
