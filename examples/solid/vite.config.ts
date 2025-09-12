import { imitari } from 'unplugin-imitari';
// import { blurhashAS } from 'unplugin-blurhash-as';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    solidPlugin(),
    imitari.vite({
      local: {
        sizes: [480, 600],
        quality: 80,
        publicPath: 'public',
      },
      remote: {
        transformURL(url) {
          return {
            src: {
              source: `https://picsum.photos/seed/${url}/1200/900.webp`,
              width: 1080,
              height: 760,
            },
            variants: [
              {
                path: `https://picsum.photos/seed/${url}/800/600.jpg`,
                width: 800,
                type: 'image/jpeg'
              },
              {
                path: `https://picsum.photos/seed/${url}/400/300.jpg`,
                width: 400,
                type: 'image/jpeg'
              },
              {
                path: `https://picsum.photos/seed/${url}/800/600.png`,
                width: 800,
                type: 'image/png'
              },
              {
                path: `https://picsum.photos/seed/${url}/400/300.png`,
                width: 400,
                type: 'image/png'
              },
            ],
          };
        },
      }
    }),
  ],
});
