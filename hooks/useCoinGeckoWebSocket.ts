'use client';

import { useEffect, useRef, useState } from 'react';

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

/* =========================
   Types
========================= */

type SocketArgs = {
  coinId: string;
  poolId?: string;
  liveInterval: '1s' | '1m';
};

type SocketReturn = {
  price: ExtendedPriceData | null;
  trades: Trade[];
  ohlcv: OHLCData | null;
  isConnected: boolean;
};

/* =========================
   Hook
========================= */

export const useCoinGeckoWebSocket = (args?: SocketArgs): SocketReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribed = useRef<Set<string>>(new Set());

  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isWsReady, setIsWsReady] = useState(false);

  /* =========================
     OPEN WS CONNECTION
  ========================= */

  useEffect(() => {
    if (!args) return;

    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;

    const send = (payload: Record<string, unknown>) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    };

    ws.onopen = () => setIsWsReady(true);
    ws.onclose = () => setIsWsReady(false);
    ws.onerror = () => setIsWsReady(false);

    ws.onmessage = (event) => {
      const msg: WebSocketMessage = JSON.parse(event.data);

      if (msg.type === 'ping') {
        send({ type: 'pong' });
        return;
      }

      if (msg.type === 'confirm_subscription') {
        const { channel } = JSON.parse(msg.identifier ?? '{}');
        subscribed.current.add(channel);
        return;
      }

      // Price
      if (msg.c === 'C1') {
        setPrice({
          usd: msg.p ?? 0,
          coin: msg.i,
          price: msg.p ?? 0,
          change24h: msg.pp ?? 0,
          marketCap: msg.m ?? 0,
          volume24h: msg.v ?? 0,
          timestamp: msg.t ?? 0,
        });
      }

      // Trades
      if (msg.c === 'G2') {
        const trade: Trade = {
          price: msg.pu,
          value: msg.vo,
          amount: msg.to,
          type: msg.ty,
          timestamp: msg.t ?? 0,
        };

        setTrades((prev) => [trade, ...prev].slice(0, 7));
      }

      // OHLCV
      if (msg.ch === 'G3') {
        setOhlcv([
          msg.t ?? 0,
          Number(msg.o ?? 0),
          Number(msg.h ?? 0),
          Number(msg.l ?? 0),
          Number(msg.c ?? 0),
        ]);
      }
    };

    return () => {
      subscribed.current.clear();
      ws.close();
    };
  }, [args]);

  /* =========================
     SUBSCRIPTIONS
  ========================= */

  useEffect(() => {
    if (!args || !isWsReady) return;

    const { coinId, poolId, liveInterval } = args;
    const ws = wsRef.current;
    if (!ws) return;

    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({
          command: 'unsubscribe',
          identifier: JSON.stringify({ channel }),
        });
      });
      subscribed.current.clear();
    };

    const subscribe = (channel: string, data?: Record<string, unknown>) => {
      if (subscribed.current.has(channel)) return;

      send({ command: 'subscribe', identifier: JSON.stringify({ channel }) });

      if (data) {
        send({
          command: 'message',
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    queueMicrotask(() => {
      setPrice(null);
      setTrades([]);
      setOhlcv(null);
      unsubscribeAll();

      // Always subscribe to price
      subscribe('CGSimplePrice', {
        coin_id: [coinId],
        action: 'set_tokens',
      });

      // Pools are OPTIONAL
      if (poolId) {
        const poolAddress = poolId.replace('_', ':');

        subscribe('OnchainTrade', {
          'network_id:pool_addresses': [poolAddress],
          action: 'set_pools',
        });

        subscribe('OnchainOHLCV', {
          'network_id:pool_addresses': [poolAddress],
          interval: liveInterval,
          action: 'set_pools',
        });
      }
    });
  }, [args, isWsReady]);

  return {
    price,
    trades,
    ohlcv,
    isConnected: isWsReady,
  };
};
