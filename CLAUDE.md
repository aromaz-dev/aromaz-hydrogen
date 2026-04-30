
## Hydrogen-Specific Development Standards

### Server Components by Default

```tsx
// ✅ GOOD: Server Component (default, 0kb JS to client)
export async function ProductCard({ productId }: Props) {
  const { product } = await context.storefront.query(PRODUCT_QUERY);
  return <Card>{product.title}</Card>;
}

// ✅ GOOD: Client Component (only when interactive)
'use client';
export function AddToCartButton({ variantId }: Props) {
  const [adding, setAdding] = useState(false);
  // Interactive logic here
}

// ❌ BAD: Unnecessary client component
'use client';
export function ProductCard({ product }: Props) {
  // No interactivity, should be server component
  return <Card>{product.title}</Card>;
}
```

### Loaders for Data Fetching

```tsx
// ✅ GOOD: Loader fetches data on server/edge
export async function loader({ context, params }: LoaderFunctionArgs) {
  const { product } = await context.storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    { variables: { handle: params.handle } }
  );

  if (!product) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ product }, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
}

// ❌ BAD: Fetching in component (waterfall, client-side)
export function ProductPage() {
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch('/api/product').then(r => r.json()).then(setProduct);
  }, []);
  // Creates waterfall, client-side fetching
}
```

### GraphQL with Codegen

```tsx
// ✅ GOOD: Use generated types
import type { ProductQuery, ProductQueryVariables } from 'storefrontapi.generated';

const { product } = await storefront.query<ProductQuery>(
  PRODUCT_QUERY,
  { variables: { handle } }
);
// TypeScript knows exact shape of product

// ❌ BAD: Manual typing (gets out of sync)
const product: any = await storefront.query(PRODUCT_QUERY);
// No type safety, errors at runtime
```

### Caching Headers

```tsx
// ✅ GOOD: Set appropriate cache headers
return json({ products }, {
  headers: {
    // Cache at CDN for 1 hour, serve stale for 24 hours while revalidating
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
  }
});

// ✅ GOOD: No caching for personalized data
return json({ customer }, {
  headers: {
    'Cache-Control': 'private, no-store'
  }
});

// ❌ BAD: No cache headers (misses edge caching opportunity)
return json({ products });
```

### Performance Considerations

Every feature must consider:

1. **Bundle Size**: Use Server Components where possible (0kb JS)
2. **Lazy Loading**: Use `lazy()` for non-critical components
3. **Image Optimization**: Use `<Image>` component with proper sizing
4. **Caching**: Set appropriate `Cache-Control` headers
5. **Streaming**: Use `<Suspense>` for slow data

```tsx
// ✅ GOOD: Performance-optimized
import { lazy, Suspense } from 'react';

const Reviews = lazy(() => import('./Reviews'));

export async function ProductPage() {
  const product = await fetchProduct(); // Fast, critical

  return (
    <div>
      <ProductDetails product={product} /> {/* Server Component */}
      <Suspense fallback={<Skeleton />}>
        <Reviews productId={product.id} /> {/* Lazy loaded */}
      </Suspense>
    </div>
  );
}
```

---

## 5. Testing Requirements

### Manual Testing Checklist

Before completing any quest, test in the worktree:

```bash
# In worktree directory
cd lore/quests/<slug>/worktree

# Development testing
npm run dev
# → Test feature at http://localhost:3000

# Build testing
npm run build
# → Ensure no build errors

# Type checking
npm run typecheck
# → Ensure no TypeScript errors
```

### What to Test:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Build passes without errors
- [ ] TypeScript types are correct
- [ ] Performance is acceptable (check Network tab)
- [ ] Works on mobile viewport
- [ ] Graceful error handling (try edge cases)

---

## 6. Common Patterns and Anti-Patterns

### Route Organization

```
app/routes/
├── _index.tsx              # Homepage (/)
├── products._index.tsx     # Products listing (/products)
├── products.$handle.tsx    # Product detail (/products/:handle)
├── cart.tsx                # Cart (/cart)
├── collections.$handle.tsx # Collection (/collections/:handle)
└── account.tsx             # Account (/account)
```

### Fragment Reuse

```tsx
// ✅ GOOD: Define fragments once, reuse everywhere
const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    featuredImage {
      url
      altText
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 20) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
```

### Error Boundaries

```tsx
// ✅ GOOD: Handle errors gracefully
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return <GenericError error={error} />;
}
```

---

## 7. Resources and References

### Official Documentation

- [Shopify Hydrogen Docs](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [React Router Docs](https://reactrouter.com/)
- [Oxygen Deployment](https://shopify.dev/docs/custom-storefronts/oxygen)

### Performance Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

### Code Generation

```bash
# Generate GraphQL types
npm run codegen

# Outputs:
# - storefrontapi.generated.d.ts
# - customer-accountapi.generated.d.ts
```

---


