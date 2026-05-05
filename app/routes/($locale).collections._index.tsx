import {redirect} from 'react-router';
import type {Route} from './+types/collections._index';

export async function loader({params}: Route.LoaderArgs) {
  const localePrefix = params.locale ? `/${params.locale}` : '';

  throw redirect(`${localePrefix}/collections/all`);
}
