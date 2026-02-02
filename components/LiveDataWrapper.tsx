'use client';

import type React from 'react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import { useCoinGeckoWebSocket } from '@/hooks/useCoinGeckoWebSocket';
import DataTable from '@/components/DataTable';
import { formatCurrency, timeAgo } from '@/lib/utils';
import CoinHeader from '@/components/CoinHeader';

/* =========================
   Types
========================= */

type LiveDataProps = {
  children?: React.ReactNode;
  coinId: string;
  poolId?: string;
  coin: CoinDetailsData;
  coinOHLCData: OHLCData[];
};

/* =========================
   Component
========================= */

const LiveDataWrapper = ({ children, coinId, poolId, coin, coinOHLCData }: LiveDataProps) => {
  const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s');

  const { trades, ohlcv, price } = useCoinGeckoWebSocket(
    poolId ? { coinId, poolId, liveInterval } : undefined,
  );

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: 'Price',
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'),
    },
    {
      header: 'Amount',
      cell: (trade) => (trade.amount ? trade.amount.toFixed(4) : '-'),
    },
    {
      header: 'Value',
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),
    },
    {
      header: 'Buy / Sell',
      cell: (trade) => (
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
        </span>
      ),
    },
    {
      header: 'Time',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={
          price?.change24h ?? coin.market_data.price_change_percentage_24h
        }
        priceChangePercentage30d={
          coin.market_data.price_change_percentage_30d_in_currency?.usd ?? 0
        }
        priceChange24h={coin.market_data.price_change_24h_in_currency?.usd ?? 0}
      />

      <Separator className="divider" />

      <CandlestickChart
        coinId={coinId}
        data={coinOHLCData}
        liveOhlcv={ohlcv}
        mode="live"
        initialPeriod="daily"
        liveInterval={liveInterval}
        setLiveInterval={setLiveInterval}
      >
        {children}
      </CandlestickChart>

      {trades?.length > 0 && (
        <>
          <Separator className="divider" />
          <div className="trades">
            <h4>Recent Trades</h4>
            <DataTable columns={tradeColumns} data={trades} rowKey={(_, i) => i} />
          </div>
        </>
      )}
    </section>
  );
};

export default LiveDataWrapper;
