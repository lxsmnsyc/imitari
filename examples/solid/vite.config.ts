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
        publicPath: 'public/',
        outputPath: import.meta.dirname + 'build/images/',
      },
    }),
  ],
});
