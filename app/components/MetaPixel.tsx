'use client';

import {useAnalytics} from '@shopify/hydrogen';
import {useEffect} from 'react';

interface MetaContentItem {
  id: string;
  quantity?: number;
  item_price?: number;
}

interface MetaEventParams {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  contents?: MetaContentItem[];
  currency?: string;
  num_items?: number;
  value?: number;
}

interface ProductPayload {
  id?: string;
  title?: string;
  price?: string;
  currency?: string;
  quantity?: number;
}

interface CartLine {
  id: string;
  quantity: number;
  merchandise?: {
    id?: string;
    price?: {amount?: string; currencyCode?: string};
    product?: {id?: string; title?: string; handle?: string};
  };
}

type MetaFbq = {
  (
    command: 'init' | 'track',
    eventOrPixelId: string,
    params?: MetaEventParams,
  ): void;
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: (...args: unknown[]) => void;
  queue?: unknown[];
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: Window['fbq'];
  }
}

function extractShopifyId(gid?: string): string {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

function getProductContentId(productId?: string, fallbackId?: string): string {
  return extractShopifyId(productId || fallbackId);
}

function getAddedCartLines(
  cart: {lines?: {nodes?: CartLine[]}} | null,
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

function getPurchaseParams(data: any): MetaEventParams | null {
  const lineItems =
    data?.order?.lineItems?.nodes ||
    data?.checkout?.lineItems?.nodes ||
    data?.lineItems?.nodes ||
    data?.lineItems ||
    [];
  const currency =
    data?.order?.currencyCode ||
    data?.checkout?.currencyCode ||
    data?.currency ||
    'USD';
  const value = parseFloat(
    data?.order?.totalPrice?.amount ||
      data?.checkout?.totalPrice?.amount ||
      data?.totalPrice?.amount ||
      data?.value ||
      '0',
  );
  const contents: MetaContentItem[] = [];
  let numItems = 0;

  for (const item of lineItems) {
    const quantity = Number(item?.quantity || 1);
    const contentId = getProductContentId(
      item?.variant?.product?.id || item?.merchandise?.product?.id,
      item?.product?.id || item?.variant?.id || item?.merchandise?.id,
    );
    const itemPrice = parseFloat(
      item?.variant?.price?.amount ||
        item?.merchandise?.price?.amount ||
        item?.price?.amount ||
        '0',
    );

    if (!contentId) continue;

    numItems += quantity;
    contents.push({id: contentId, quantity, item_price: itemPrice});
  }

  if (contents.length === 0) return null;

  return {
    content_ids: contents.map((item) => item.id),
    content_type: 'product',
    contents,
    currency,
    num_items: numItems,
    value,
  };
}

function initializeMetaPixel(pixelId: string) {
  if (window.fbq?.loaded) return;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  }) as MetaFbq;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', pixelId);
}

export function MetaPixel({pixelId}: {pixelId?: string | null}) {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Meta Pixel');

  useEffect(() => {
    if (!pixelId) {
      ready();
      return;
    }

    initializeMetaPixel(pixelId);

    subscribe('page_viewed', () => {
      window.fbq?.('track', 'PageView');
    });

    subscribe('product_viewed', (data: any) => {
      const product = data?.products?.[0] as ProductPayload | undefined;
      const contentId = getProductContentId(product?.id);
      if (!product || !contentId) return;

      window.fbq?.('track', 'ViewContent', {
        content_ids: [contentId],
        content_type: 'product',
        content_name: product.title,
        contents: [
          {
            id: contentId,
            quantity: product.quantity || 1,
            item_price: parseFloat(product.price || '0') || 0,
          },
        ],
        currency: product.currency || 'USD',
        value: parseFloat(product.price || '0') || 0,
      });
    });

    subscribe('cart_updated', (data: any) => {
      const addedLines = getAddedCartLines(data?.cart, data?.prevCart);
      if (addedLines.length === 0) return;

      let value = 0;
      let currency = 'USD';
      let numItems = 0;
      const contents: MetaContentItem[] = [];

      for (const {line, addedQuantity} of addedLines) {
        const merchandise = line.merchandise;
        const contentId = getProductContentId(
          merchandise?.product?.id,
          merchandise?.id,
        );
        const price = parseFloat(merchandise?.price?.amount || '0') || 0;

        if (!contentId) continue;

        currency = merchandise?.price?.currencyCode || currency;
        value += price * addedQuantity;
        numItems += addedQuantity;
        contents.push({
          id: contentId,
          quantity: addedQuantity,
          item_price: price,
        });
      }

      if (contents.length === 0) return;

      window.fbq?.('track', 'AddToCart', {
        content_ids: contents.map((item) => item.id),
        content_type: 'product',
        contents,
        currency,
        num_items: numItems,
        value,
      });
    });

    const trackPurchase = (data: any) => {
      const params = getPurchaseParams(data);
      if (!params) return;
      window.fbq?.('track', 'Purchase', params);
    };

    subscribe('custom_checkout_completed', trackPurchase);
    subscribe('custom_purchase', trackPurchase);

    ready();
  }, [pixelId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
