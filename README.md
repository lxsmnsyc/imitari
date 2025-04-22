# imitari

> Image component

[![NPM](https://img.shields.io/npm/v/imitari.svg)](https://www.npmjs.com/package/imitari) [![JavaScript Style Guide](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

## Install

```bash
npm install --save imitari
```

```bash
yarn add imitari
```

```bash
pnpm add imitari
```

## Usage

```js
import { Imitari } from 'imitari';
import * as myImage from './path/to/image.png?imitari';

export function MyComponent() {
  return (
    <Imitari src={myImage.source} width={myImage.width} height={myImage.height}>
      {(show, onLoad) => (
        <Show when={show()}>
          <Skeleton onLoad={onLoad} />
        </Show>
      )}
    </Imitari>
  );
}
```

## Sponsors

![Sponsors](https://github.com/lxsmnsyc/sponsors/blob/main/sponsors.svg?raw=true)

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)
