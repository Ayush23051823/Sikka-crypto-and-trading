export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';

/* =========================
   Types
========================= */

type CoinDetailsData = {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: Record<string, number>;
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_30d_in_currency?: { usd: number };
    price_change_24h_in_currency?: { usd: number };
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url: string;
  };
};

type OHLCData = [number, number, number, number, number];

/* =========================
   Page
========================= */

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  let coinData: CoinDetailsData;
  let coinOHLCData: OHLCData[];

  try {
    [coinData, coinOHLCData] = await Promise.all([
      fetcher<CoinDetailsData>(`coins/${id}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: false,
        sparkline: false,
      }),
      fetcher<OHLCData[]>(`coins/${id}/ohlc`, {
        vs_currency: 'usd',
        days: 1,
      }),
    ]);
  } catch {
    return (
      <main className="main-container">
        <Link href="/coins" className="text-sm text-muted-foreground">
          ← Back to Coins
        </Link>
        <p className="mt-6 text-red-500">This asset is not a supported coin on CoinGecko.</p>
      </main>
    );
  }

  const coinDetails = [
    {
      label: 'Market Cap',
      value: formatCurrency(coinData.market_data.market_cap.usd),
    },
    {
      label: 'Market Cap Rank',
      value: `#${coinData.market_cap_rank}`,
    },
    {
      label: 'Total Volume',
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: 'Website',
      link: coinData.links.homepage?.[0],
      linkText: 'Homepage',
    },
    {
      label: 'Explorer',
      link: coinData.links.blockchain_site?.[0],
      linkText: 'Explorer',
    },
    {
      label: 'Community',
      link: coinData.links.subreddit_url,
      linkText: 'Subreddit',
    },
  ];

  return (
    <main id="coin-details-page" className="main-container">
      <Link href="/coins" className="text-sm text-muted-foreground">
        ← Back to Coins
      </Link>

      <section className="primary mt-6">
        <LiveDataWrapper coinId={id} coin={coinData} coinOHLCData={coinOHLCData}>
          <h4>Price Overview</h4>
        </LiveDataWrapper>
      </section>

      <section className="secondary mt-8 space-y-6">
        <Converter
          symbol={coinData.symbol}
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />

        <div className="details">
          <h4>Coin Details</h4>

          <ul className="details-grid">
            {coinDetails.map(({ label, value, link, linkText }, index) => (
              <li key={index}>
                <p className="text-muted-foreground">{label}</p>

                {link ? (
                  <div className="link flex items-center gap-1">
                    <Link href={link} target="_blank">
                      {linkText}
                    </Link>
                    <ArrowUpRight size={14} />
                  </div>
                ) : (
                  <p className="text-base font-medium">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default Page;
