'use server';

import qs from 'query-string';

/* =========================
   BASE CONFIG
========================= */

const BASE_URL = process.env.BASE_URL || 'https://api.coingecko.com/api/v3';

/* =========================
   FETCHER (CORE)
========================= */

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 300,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText}`);
  }

  return response.json();
}

/* =========================
   SIMPLE PRICE (FREE SAFE)
========================= */

export async function getSimplePrice(id: string): Promise<number | null> {
  try {
    const data = await fetcher<Record<string, { usd: number }>>(
      'simple/price',
      {
        ids: id,
        vs_currencies: 'usd',
      },
      300,
    );

    return data?.[id]?.usd ?? null;
  } catch {
    return null;
  }
}

/* =========================
   SEARCH COINS (ADD THIS ⬇️)
========================= */

export type CoinSearchResult = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
};

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  if (!query || query.length < 2) return [];

  const data = await fetcher<{
    coins: CoinSearchResult[];
  }>('search', { query }, 60);

  return data.coins.slice(0, 8);
}
