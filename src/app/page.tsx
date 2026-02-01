'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableNumber) {
      router.push(`/menu?table=${tableNumber}`);
    }
  };

  const handleInstall = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  return (
    <div className="flex-center" style={{
      height: '100vh',
      flexDirection: 'column',
      gap: '2rem',
      backgroundColor: 'var(--background)'
    }}>
      <div className="glass-card flex-col" style={{ width: '400px', padding: '3rem', textAlign: 'center', boxShadow: 'none', border: 'none' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
          Table2Kitchen
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Seamless Dining Experience
        </p>

        <form onSubmit={handleStart} className="flex-col" style={{ gap: '1rem' }}>
          <input
            type="number"
            placeholder="Enter Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            style={{
              padding: '1.25rem',
              fontSize: '1.5rem',
              textAlign: 'center',
              borderRadius: 'var(--radius)',
              width: '100%',
              boxSizing: 'border-box'
            }}
            required
            min="1"
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '1rem', fontSize: '1.1rem', width: '100%' }}
          >
            Start Ordering
          </button>
        </form>
      </div>

      {/* App Controls */}
      <div className="flex-center" style={{ gap: '1rem' }}>
        {installPrompt && (
          <button onClick={handleInstall} className="btn btn-ghost">
            Download App
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: '30px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        <p style={{ marginBottom: '0.5rem' }}>Kiosk Mode • v1.0</p>
        <p style={{ marginBottom: '1rem' }}>Mobile Access: <strong>http://192.168.0.103:3000</strong></p>

        <div style={{ opacity: 0.6, display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <span onClick={() => router.push('/admin/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Admin</span>
          <span onClick={() => router.push('/kitchen/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Kitchen</span>
        </div>
      </div>
    </div>
  );
}
