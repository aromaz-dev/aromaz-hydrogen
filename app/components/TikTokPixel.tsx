'use client';

import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

interface TikTokContentsItem {
  content_id: string;
  content_type?: string;
  content_name?: string;
  quantity?: number;
  price?: number;
}

interface TikTokEventParams {
  content_id?: string;
  content_type?: string;
  content_name?: string;
  contents?: TikTokContentsItem[];
  value?: number;
  currency?: string;
  quantity?: number;
  query?: string;
}

declare global {
  interface Window {
    TiktokAnalyticsObject: string;
    ttq: {
      page: () => void;
      track: (event: string, params?: TikTokEventParams) => void;
      identify: (params: Record<string, string>) => void;
      enableCookie: () => void;
      disableCookie: () => void;
      holdConsent: () => void;
      grantConsent: () => void;
      revokeConsent: () => void;
    };
  }
}

function extractShopifyId(gid: string): string {
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    price: {amount: string; currencyCode: string};
    product: {id: string; title: string; handle: string};
  };
}

function getAddedCartLines(
  cart: {lines?: {nodes?: CartLine[]}},
  prevCart: {lines?: {nodes?: CartLine[]}} | null,
): Array<{line: CartLine; addedQuantity: number}> {
  const currentLines = cart?.lines?.nodes || [];
  const previousLines = prevCart?.lines?.nodes || [];

  const prevQuantityMap = new Map<string, number>();
  for (const line of previousLines) {
    const merchandiseId = line.merchandise?.id;
    if (merchandiseId) {
      prevQuantityMap.set(merchandiseId, line.quantity);
    }
  }

  const added: Array<{line: CartLine; addedQuantity: number}> = [];
  for (const line of currentLines) {
    const merchandiseId = line.merchandise?.id;
    if (!merchandiseId) continue;

    const prevQty = prevQuantityMap.get(merchandiseId) || 0;
    if (line.quantity > prevQty) {
      added.push({line, addedQuantity: line.quantity - prevQty});
    }
  }

  return added;
}

export function TikTokPixel() {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('TikTok Pixel');

  useEffect(() => {
    // Base pixel code is injected in <head> via root.tsx Layout.
    // This component only subscribes to Hydrogen analytics events
    // and maps them to ttq.track() calls.

    subscribe('page_viewed', () => {
      window.ttq?.page();
    });

    subscribe('product_viewed', (data: any) => {
      const product = data?.products?.[0];
      if (!product) return;

      window.ttq?.track('ViewContent', {
        content_id: extractShopifyId(product.id),
        content_type: 'product',
        content_name: product.title,
        value: parseFloat(product.price) || 0,
        currency: product.currency || 'USD',
        quantity: product.quantity || 1,
      });
    });

    subscribe('collection_viewed', (data: any) => {
      const collection = data?.collection;
      if (!collection) return;

      window.ttq?.track('ViewContent', {
        content_id: extractShopifyId(collection.id),
        content_type: 'product_group',
        content_name: collection.handle,
      });
    });

    subscribe('cart_updated', (data: any) => {
      const {cart, prevCart} = data;
      const addedLines = getAddedCartLines(cart, prevCart);

      if (addedLines.length === 0) return;

      let totalValue = 0;
      let currency = 'USD';
      const contents: TikTokContentsItem[] = [];

      for (const {line, addedQuantity} of addedLines) {
        const merchandise = line.merchandise;
        const price = parseFloat(merchandise?.price?.amount || '0');
        currency = merchandise?.price?.currencyCode || currency;

        totalValue += price * addedQuantity;
        contents.push({
          content_id: extractShopifyId(
            merchandise?.product?.id || merchandise?.id || '',
          ),
          content_type: 'product',
          content_name: merchandise?.product?.title || '',
          quantity: addedQuantity,
          price,
        });
      }

      window.ttq?.track('AddToCart', {
        contents,
        value: totalValue,
        currency,
      });
    });

    subscribe('search_viewed', (data: any) => {
      window.ttq?.track('Search', {
        query: data?.searchTerm || '',
      });
    });

    ready();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
