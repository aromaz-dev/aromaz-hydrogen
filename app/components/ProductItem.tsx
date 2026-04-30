import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="group block"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="bg-off-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
        {image && (
          <div className="aspect-square overflow-hidden">
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <div className="p-6">
          <h4 className="font-serif text-xl md:text-2xl text-charcoal mb-3 transition-colors duration-300 group-hover:text-terracotta">
            {product.title}
          </h4>
          <div className="font-sans text-lg text-rose-gold font-medium">
            <Money data={product.priceRange.minVariantPrice} />
          </div>
        </div>
      </div>
    </Link>
  );
}
