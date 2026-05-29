/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

declare module '*.png' {
    const src: string;
    export default src;
}
