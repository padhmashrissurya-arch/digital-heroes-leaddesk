'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, Loader2, KeyRound } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('admin@leaddesk.com');
  const [password, setPassword] = useState('AdminSecret123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Invalid email or password.');
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Network error while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="form-header" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#3b82f6',
          }}
        >
          <Lock size={24} />
        </div>
        <h2>Admin Portal Authentication</h2>
        <p>Enter your administrator credentials to access lead management.</p>
      </div>

      {/* Test Credentials Helper Box */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px dashed rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: '#60a5fa',
            marginBottom: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <KeyRound size={14} />
          Seed Test Credentials:
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Email:{' '}
          <code
            style={{
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
            }}
          >
            admin@leaddesk.com
          </code>
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Password:{' '}
          <code
            style={{
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
            }}
          >
            AdminSecret123!
          </code>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Admin Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '0.85rem' }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Authenticating...
            </>
          ) : (
            'Sign In to Dashboard'
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="container">
      <div className="login-wrapper">
        <Suspense
          fallback={
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              Loading auth portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
