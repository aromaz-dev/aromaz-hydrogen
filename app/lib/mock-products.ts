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
        image: { url: 'https://placehold.co/400x400/000000/ffffff?text=Midnight+Black', altText: 'Black Case' },
      },
      {
        id: 'gid://shopify/ProductVariant/2',
        title: 'Burnt Orange',
        availableForSale: true,
        price: { amount: '15.00', currencyCode: 'EUR' },
        image: { url: 'https://placehold.co/400x400/cc5500/ffffff?text=Burnt+Orange', altText: 'Orange Case' },
      },
      {
        id: 'gid://shopify/ProductVariant/5',
        title: 'Ocean Blue',
        availableForSale: true,
        price: { amount: '15.00', currencyCode: 'EUR' },
        image: { url: 'https://placehold.co/400x400/004488/ffffff?text=Ocean+Blue', altText: 'Blue Case' },
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
        image: { url: 'https://placehold.co/400x400/88ccff/ffffff?text=Wavy+Days', altText: 'Wavy Days Refill' },
      },
      {
        id: 'gid://shopify/ProductVariant/4',
        title: 'Night Tales',
        availableForSale: true,
        price: { amount: '6.00', currencyCode: 'EUR' },
        image: { url: 'https://placehold.co/400x400/333333/ffffff?text=Night+Tales', altText: 'Night Tales Refill' },
      },
       {
        id: 'gid://shopify/ProductVariant/6',
        title: 'Sun Scent',
        availableForSale: true,
        price: { amount: '6.00', currencyCode: 'EUR' },
        image: { url: 'https://placehold.co/400x400/ffaa00/ffffff?text=Sun+Scent', altText: 'Sun Scent Refill' },
      },
    ]
  }
};
