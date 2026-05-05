import {StockistsPage} from '~/components/StockistsPage';

export const meta = () => {
  return [
    {title: 'Aromaz | Find a Store'},
    {
      name: 'description',
      content:
        'Find Aromaz retail partners, refill locations, and future stockists.',
    },
  ];
};

export default function StockistsRoute() {
  return <StockistsPage />;
}
