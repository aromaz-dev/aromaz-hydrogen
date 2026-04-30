import {redirect} from 'react-router';
import type {Route} from './+types/checkout-redirect';

/**
 * Checkout Redirect Route
 *
 * This route is used by the customize flow to redirect to Shopify's checkout.
 * It reads the cart's checkoutUrl and performs a redirect.
 */
export async function loader({context}: Route.LoaderArgs) {
  const {cart} = context;

  // Get the current cart
  const cartData = await cart.get();

  // If there's a checkout URL, redirect to it
  if (cartData?.checkoutUrl) {
    return redirect(cartData.checkoutUrl);
  }

  // Fallback to cart page if no checkout URL
  return redirect('/cart');
}

export default function CheckoutRedirect() {
  return null;
}
