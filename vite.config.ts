import { defineConfig } from 'vite';
import {
  sallaBuildPlugin,
  sallaDemoPlugin,
  sallaTransformPlugin,
} from '@salla.sa/twilight-bundles/vite-plugins';

export default defineConfig({
  plugins: [
    sallaTransformPlugin(),
    sallaBuildPlugin(),
    sallaDemoPlugin({
      components: ['independent-cart', 'expanding-products'],
      grid: {
        columns: '1fr',
        gap: '1rem',
        minWidth: '320px',
      },
    }),
  ],
});
