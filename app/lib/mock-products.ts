export const MOCK_CASE_PRODUCT = {
  id: 'gid://shopify/Product/1',
  title: 'Refillable Case',
  handle: 'fussy-deodorant-case',
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/1',
        title: 'Midnight Black',
        availableForSale: true,
        price: { amount: '15.00', currencyCode: 'EUR' },
        image: { url: '/brand-story/artisanal-craft.jpg', altText: 'Black Case' },
      },
      {
        id: 'gid://shopify/ProductVariant/2',
        title: 'Burnt Orange',
        availableForSale: true,
        price: { amount: '15.00', currencyCode: 'EUR' },
        image: { url: '/hero-bg.jpg', altText: 'Orange Case' },
      },
      {
        id: 'gid://shopify/ProductVariant/5',
        title: 'Ocean Blue',
        availableForSale: true,
        price: { amount: '15.00', currencyCode: 'EUR' },
        image: { url: '/brand-story/natural-ingredients.jpg', altText: 'Blue Case' },
      },
    ]
  }
};

export const MOCK_REFILL_PRODUCT = {
  id: 'gid://shopify/Product/2',
  title: 'Deodorant Refill',
  handle: 'fussy-deodorant-refill',
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/3',
        title: 'Wavy Days',
        availableForSale: true,
        price: { amount: '6.00', currencyCode: 'EUR' },
        image: { url: '/ingredients/lavender.jpg', altText: 'Wavy Days Refill' },
      },
      {
        id: 'gid://shopify/ProductVariant/4',
        title: 'Night Tales',
        availableForSale: true,
        price: { amount: '6.00', currencyCode: 'EUR' },
        image: { url: '/ingredients/rose.jpg', altText: 'Night Tales Refill' },
      },
       {
        id: 'gid://shopify/ProductVariant/6',
        title: 'Sun Scent',
        availableForSale: true,
        price: { amount: '6.00', currencyCode: 'EUR' },
        image: { url: '/ingredients/chamomile.jpg', altText: 'Sun Scent Refill' },
      },
    ]
  }
};
