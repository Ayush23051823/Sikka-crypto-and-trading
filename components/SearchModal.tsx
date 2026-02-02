'use client';

import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { searchCoins, CoinSearchResult } from '@/lib/coingecko.actions';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchModal = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ESC close
  useEffect(() => {
    if (!open) return;

    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCoins(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl bg-dark-400 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white">
            <Search size={18} />
            <span className="font-semibold">Search Coins</span>
          </div>
          <button onClick={onClose}>
            <X className="text-muted-foreground hover:text-white" />
          </button>
        </div>

        {/* Input */}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Bitcoin, Ethereum..."
          className="
            w-full rounded-lg bg-dark-300 px-4 py-3
            text-white outline-none
            placeholder:text-muted-foreground
            focus:ring-2 focus:ring-green-500
          "
        />

        {/* Results */}
        <div className="mt-4 space-y-2">
          {loading && <p className="text-muted-foreground text-sm">Searching...</p>}

          {results.map((coin) => (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              onClick={onClose}
              className="
                flex items-center gap-3 rounded-lg px-3 py-2
                hover:bg-dark-300 transition
              "
            >
              <Image src={coin.thumb} alt={coin.name} width={28} height={28} />
              <div>
                <p className="text-white font-medium">{coin.name}</p>
                <p className="text-xs uppercase text-muted-foreground">{coin.symbol}</p>
              </div>
            </Link>
          ))}

          {!loading && query.length > 1 && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
