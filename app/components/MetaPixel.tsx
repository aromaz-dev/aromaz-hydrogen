'use client';

import {useAnalytics} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';

interface MetaContentItem {
  id: string;
  item_group_id?: string;
  quantity?: number;
  item_price?: number;
}

interface MetaEventParams {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  content_name?: string;
  contents?: MetaContentItem[];
  currency?: string;
  item_group_id?: string;
  num_items?: number;
  value?: number;
}

interface ProductPayload {
  id?: string;
  title?: string;
  price?: string;
  currency?: string;
  quantity?: number;
  variantId?: string;
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
  getState?: () => {
    pixels?: Array<{
      id?: string;
    }>;
  };
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

function getMetaContentId(variantId?: string, fallbackId?: string): string {
  return extractShopifyId(variantId || fallbackId);
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

function getAddToCartParams(
  addedLines: Array<{line: CartLine; addedQuantity: number}>,
): MetaEventParams | null {
  let value = 0;
  let currency = 'USD';
  let numItems = 0;
  const contents: MetaContentItem[] = [];

  for (const {line, addedQuantity} of addedLines) {
    const merchandise = line.merchandise;
    const contentId = getMetaContentId(merchandise?.id);
    const itemGroupId = extractShopifyId(merchandise?.product?.id);
    const price = parseFloat(merchandise?.price?.amount || '0') || 0;

    if (!contentId) continue;

    currency = merchandise?.price?.currencyCode || currency;
    value += price * addedQuantity;
    numItems += addedQuantity;
    contents.push({
      id: contentId,
      item_group_id: itemGroupId || undefined,
      quantity: addedQuantity,
      item_price: price,
    });
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
    const contentId = getMetaContentId(
      item?.variant?.id || item?.merchandise?.id,
      item?.product?.id ||
        item?.variant?.product?.id ||
        item?.merchandise?.product?.id,
    );
    const itemGroupId = extractShopifyId(
      item?.variant?.product?.id ||
        item?.merchandise?.product?.id ||
        item?.product?.id,
    );
    const itemPrice = parseFloat(
      item?.variant?.price?.amount ||
        item?.merchandise?.price?.amount ||
        item?.price?.amount ||
        '0',
    );

    if (!contentId) continue;

    numItems += quantity;
    contents.push({
      id: contentId,
      item_group_id: itemGroupId || undefined,
      quantity,
      item_price: itemPrice,
    });
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

function hasInitializedMetaPixel(pixelId: string) {
  return Boolean(
    window.fbq
      ?.getState?.()
      ?.pixels?.some((pixel) => pixel.id === pixelId),
  );
}

function initializeMetaPixel(pixelId: string) {
  if (hasInitializedMetaPixel(pixelId)) return;

  if (window.fbq?.loaded) {
    window.fbq('init', pixelId);
    return;
  }

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
  const cartFallbackTimers = useRef<Record<string, number>>({});

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
      const contentId = getMetaContentId(product?.variantId, product?.id);
      const itemGroupId = extractShopifyId(product?.id);
      if (!product || !contentId) return;

      window.fbq?.('track', 'ViewContent', {
        content_ids: [contentId],
        content_type: 'product',
        content_name: product.title,
        item_group_id: itemGroupId || undefined,
        contents: [
          {
            id: contentId,
            item_group_id: itemGroupId || undefined,
            quantity: product.quantity || 1,
            item_price: parseFloat(product.price || '0') || 0,
          },
        ],
        currency: product.currency || 'USD',
        value: parseFloat(product.price || '0') || 0,
      });
    });

    subscribe('product_added_to_cart', (data: any) => {
      const currentLine = data?.currentLine as CartLine | undefined;
      if (!currentLine) return;

      const fallbackKey = data?.cart?.updatedAt;
      if (fallbackKey && cartFallbackTimers.current[fallbackKey]) {
        window.clearTimeout(cartFallbackTimers.current[fallbackKey]);
        delete cartFallbackTimers.current[fallbackKey];
      }

      const previousQuantity = Number(data?.prevLine?.quantity || 0);
      const currentQuantity = Number(currentLine.quantity || 1);
      const addedQuantity = Math.max(currentQuantity - previousQuantity, 1);
      const params = getAddToCartParams([{line: currentLine, addedQuantity}]);
      if (!params) return;

      window.fbq?.('track', 'AddToCart', params);
    });

    subscribe('cart_updated', (data: any) => {
      const addedLines = getAddedCartLines(data?.cart, data?.prevCart);
      if (addedLines.length === 0) return;

      const fallbackKey = data?.cart?.updatedAt || String(Date.now());
      if (cartFallbackTimers.current[fallbackKey]) {
        window.clearTimeout(cartFallbackTimers.current[fallbackKey]);
      }

      cartFallbackTimers.current[fallbackKey] = window.setTimeout(() => {
        const params = getAddToCartParams(addedLines);
        if (params) window.fbq?.('track', 'AddToCart', params);
        delete cartFallbackTimers.current[fallbackKey];
      }, 100);
    });

    const trackPurchase = (data: any) => {
      const params = getPurchaseParams(data);
      if (!params) return;
      window.fbq?.('track', 'Purchase', params);
    };

    subscribe('custom_checkout_completed', trackPurchase);
    subscribe('custom_purchase', trackPurchase);

    ready();

    return () => {
      Object.values(cartFallbackTimers.current).forEach((timer) => {
        window.clearTimeout(timer);
      });
      cartFallbackTimers.current = {};
    };
  }, [pixelId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
