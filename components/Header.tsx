'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchModal from '@/components/SearchModal';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="main-container flex items-center justify-between h-[64px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Sikka" width={250} height={40} />
            <span className="text-white font-semibold"></span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-8">
            <Link href="/" className={cn('nav-link', pathname === '/' && 'is-active')}>
              Dashboard
            </Link>

            <Link href="/coins" className={cn('nav-link', pathname === '/coins' && 'is-active')}>
              Market
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition"
            >
              <Search size={18} />
              <span className="hidden md:block">Search</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MODAL */}
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Header;
