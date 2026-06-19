export interface MetaAddToCartItem {
  variantId?: string;
  productId?: string;
  quantity?: number;
  price?: string | number;
  currency?: string;
}

interface MetaContentItem {
  id: string;
  item_group_id?: string;
  quantity: number;
  item_price: number;
}

interface MetaEventParams {
  content_ids: string[];
  content_type: 'product';
  contents: MetaContentItem[];
  currency: string;
  num_items: number;
  value: number;
}

declare global {
  interface Window {
    __aromazTrackedAddToCartKeys?: Set<string>;
  }
}

function extractShopifyId(gid?: string): string {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || gid;
}

export function trackMetaAddToCart(
  items: MetaAddToCartItem[],
  eventKey?: string,
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    if (typeof window !== 'undefined') {
      console.log('[ATC DEBUG] firing fbq AddToCart');
      console.log('[ATC DEBUG] payload', {
        skipped: true,
        reason: 'window.fbq missing',
        fbqType: typeof window.fbq,
        items,
        eventKey,
      });
    }
    return false;
  }

  if (eventKey) {
    window.__aromazTrackedAddToCartKeys ||= new Set<string>();
    if (window.__aromazTrackedAddToCartKeys.has(eventKey)) return false;
    window.__aromazTrackedAddToCartKeys.add(eventKey);
  }

  let value = 0;
  let numItems = 0;
  let currency = 'CAD';
  const contents: MetaContentItem[] = [];

  for (const item of items) {
    const id = extractShopifyId(item.variantId);
    if (!id) continue;

    const quantity = item.quantity || 1;
    const itemPrice = Number(item.price || 0) || 0;
    const itemGroupId = extractShopifyId(item.productId);

    currency = item.currency || currency;
    value += itemPrice * quantity;
    numItems += quantity;
    contents.push({
      id,
      item_group_id: itemGroupId || undefined,
      quantity,
      item_price: itemPrice,
    });
  }

  if (contents.length === 0) return false;

  const payload: MetaEventParams = {
    content_ids: contents.map((item) => item.id),
    content_type: 'product',
    contents,
    currency,
    num_items: numItems,
    value: Math.round(value * 100) / 100,
  };

  console.log('[ATC DEBUG] firing fbq AddToCart');
  console.log('[ATC DEBUG] payload', payload);

  window.fbq('track', 'AddToCart', payload);

  return true;
}
