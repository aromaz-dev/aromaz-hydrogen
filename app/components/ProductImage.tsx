import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {LOCAL_IMAGE_FALLBACKS, isDemoOrPlaceholderImage} from '~/lib/local-images';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  if (!image) {
    return (
      <div className="w-full md:rounded-lg overflow-hidden bg-off-white">
        <img
          alt="Aromaz product"
          src={LOCAL_IMAGE_FALLBACKS.product}
          className="w-full h-[40vh] min-h-[280px] md:h-auto md:aspect-square object-cover"
        />
      </div>
    );
  }
  if (isDemoOrPlaceholderImage(image.url)) {
    return (
      <div className="w-full md:rounded-lg overflow-hidden bg-off-white">
        <img
          alt={image.altText || 'Aromaz product'}
          src={LOCAL_IMAGE_FALLBACKS.product}
          className="w-full h-[40vh] min-h-[280px] md:h-auto md:aspect-square object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full md:rounded-lg overflow-hidden bg-off-white">
      <Image
        alt={image.altText || 'Product Image'}
        data={image}
        key={image.id}
        className="w-full h-[40vh] min-h-[280px] md:h-auto md:aspect-square object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
    </div>
  );
}
