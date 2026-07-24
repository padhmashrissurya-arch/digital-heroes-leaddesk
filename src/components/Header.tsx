'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Sparkles, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication state if on /admin routes
    if (pathname.startsWith('/admin')) {
      fetch('/api/admin/auth/me')
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.authenticated))
        .catch(() => setIsAdmin(false));
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setIsAdmin(false);
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand-logo">
          <Sparkles size={22} className="text-primary" style={{ color: '#3b82f6' }} />
          <span>LeadDesk</span>
          <span className="brand-badge">Mini</span>
        </Link>

        <nav className="nav-links">
          <Link href="/" className={`btn-link ${pathname === '/' ? 'text-white' : ''}`}>
            Lead Form
          </Link>
          
          <Link href="/admin" className={`btn-link ${pathname.startsWith('/admin') ? 'text-white' : ''}`}>
            Admin Dashboard
          </Link>

          {isAdmin && (
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              <LogOut size={15} />
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
