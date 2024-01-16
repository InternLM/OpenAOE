import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import { Plugin as PluginImportToCDN } from 'vite-plugin-cdn-import';
import { ProxyConfig, ImportToCDNList, alias } from './scripts';
import { resolvePath } from './scripts/utils';

// docs: https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // vite-plugin-cdn-import only works in build, not in dev, dev still depends on the package installed by npm
        PluginImportToCDN({
            modules: ImportToCDNList
        }),
        splitVendorChunkPlugin(),
        react()
    ],
    css: {
        modules: {
            localsConvention: 'camelCase'
        },
        preprocessorOptions: {
            less: {
                additionalData: `@import (reference) url("${resolvePath('src/styles/variables.less')}");`
            }
        }
    },
    server: {
        host: true,
        proxy: ProxyConfig
    },
    envDir: resolvePath('env'),
    resolve: {
        alias
    },
    base: '',
});
