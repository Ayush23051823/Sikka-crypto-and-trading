import Image from 'next/image';
import { fetcher } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

/* =========================
   Types
========================= */

type CoinDetailsData = {
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
  };
};

type OHLCData = [number, number, number, number, number];

/* =========================
   Component
========================= */

const CoinOverview = async () => {
  try {
    const coin = await fetcher<CoinDetailsData>('coins/bitcoin', {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    });

    let ohlcData: OHLCData[] = [];

    try {
      ohlcData = await fetcher<OHLCData[]>('coins/bitcoin/ohlc', {
        vs_currency: 'usd',
        days: 1,
      });
    } catch (err) {
      console.warn('OHLC data unavailable (free API limit)');
    }

    return (
      <div id="coin-overview">
        <CandlestickChart data={ohlcData} coinId="bitcoin">
          <div className="header pt-2 flex items-center gap-4">
            <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
            <div className="info">
              <p>
                {coin.name} / {coin.symbol.toUpperCase()}
              </p>
              <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
