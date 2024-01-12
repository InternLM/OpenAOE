/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_NODE: string,
    // More env variables...
    // variable name must start with VITE_
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
