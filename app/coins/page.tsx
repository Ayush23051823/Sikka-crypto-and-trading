export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency, formatPercentage } from '@/lib/utils';

type CoinDetails = {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
  };
};

const CoinPage = async ({ params }: { params: { id: string } }) => {
  const coin = await fetcher<CoinDetails>(`coins/${params.id}`, {
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
    sparkline: false,
  });

  const isUp = coin.market_data.price_change_percentage_24h > 0;

  return (
    <main className="main-container">
      <Link href="/coins" className="text-sm text-muted-foreground">
        ← Back to Coins
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <Image src={coin.image.large} alt={coin.name} width={64} height={64} />

        <div>
          <h1 className="text-2xl font-semibold">
            {coin.name} <span className="uppercase text-muted-foreground">({coin.symbol})</span>
          </h1>

          <p className="text-xl font-medium">
            {formatCurrency(coin.market_data.current_price.usd)}
          </p>

          <p className={isUp ? 'text-green-500' : 'text-red-500'}>
            {isUp && '+'}
            {formatPercentage(coin.market_data.price_change_percentage_24h)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-muted-foreground">Market Cap</p>
        <p className="text-lg font-semibold">{formatCurrency(coin.market_data.market_cap.usd)}</p>
      </div>
    </main>
  );
};

export default CoinPage;
