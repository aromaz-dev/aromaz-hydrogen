import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {getLocalProductImage, isDemoOrPlaceholderImage} from '~/lib/local-images';

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
  const localImage = getLocalProductImage(product.title, product.handle);
  const useLocalImage = isDemoOrPlaceholderImage(image?.url);
  const title = product.title.toLowerCase();
  const productType = title.includes('refill')
    ? 'Refill'
    : title.includes('deodorant')
    ? 'Deodorant'
    : title.includes('soap') || title.includes('loofah')
    ? 'Soap'
    : title.includes('balm')
    ? 'Daily care'
    : 'Aromaz care';
  return (
    <Link
      className="product-card group"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="product-card-media">
        {useLocalImage ? (
          <img
            alt={product.title}
            src={localImage}
            loading={loading}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 360px, 100vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="product-card-body">
        <div>
          <p className="product-card-kicker">{productType}</p>
          <h4>
            {product.title}
          </h4>
        </div>
        <div className="product-card-footer">
          <span>
            <Money data={product.priceRange.minVariantPrice} />
          </span>
          <small>Shop now</small>
        </div>
      </div>
    </Link>
  );
}
