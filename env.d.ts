/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    JUDGEME_API_TOKEN?: string;
    JUDGEME_SHOP_DOMAIN?: string;
    PUBLIC_META_PIXEL_ID?: string;
  }
}
