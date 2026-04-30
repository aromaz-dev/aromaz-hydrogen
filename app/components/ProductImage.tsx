import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  if (!image) {
    return (
      <div className="w-full h-[40vh] min-h-[280px] md:aspect-square md:h-auto md:rounded-lg bg-off-white flex items-center justify-center">
        <span className="text-charcoal/30 font-sans text-sm">No image</span>
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
