/// <reference types="vite/client" />
/**
 *  Define more env variables here
 *  variable name must start with VITE_
 */
interface ImportMetaEnv {
    readonly VITE_NODE: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
