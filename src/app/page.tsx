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
        console.log('User accepted the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <div className="flex-center" style={{
      height: '100vh',
      flexDirection: 'column',
      gap: '2rem',
      backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
    }}>
      <div className="glass-card flex-col" style={{ width: '400px', padding: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #4ade80, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Table2Kitchen
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Experience the future of dining
        </p>

        <form onSubmit={handleStart} className="flex-col" style={{ gap: '1rem' }}>
          <input
            type="number"
            placeholder="Enter Table Number"
            className="glass"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            style={{
              padding: '1rem',
              fontSize: '1.2rem',
              textAlign: 'center',
              color: 'white',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            required
            min="1"
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '1rem' }}
          >
            Start Ordering
          </button>
        </form>
      </div>

      {/* App Controls */}
      <div className="flex-center" style={{ gap: '1rem' }}>
        {installPrompt && (
          <button onClick={handleInstall} className="btn btn-ghost" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            ⬇ Install App
          </button>
        )}
      </div>

      {/* Footer Area for Kiosk */}
      <div style={{ position: 'fixed', bottom: '20px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
        <p>Kiosk Mode • Table2Kitchen v1.0</p>
        <p style={{ marginTop: '0.5rem', color: 'var(--primary)' }}>
          📱 Mobile Access: <strong>http://192.168.0.103:3000</strong>
        </p>
        {/* Admin Links */}
        <div style={{ marginTop: '10px', opacity: 0.5 }}>
          <span onClick={() => router.push('/admin/login')} style={{ cursor: 'pointer', marginRight: '1rem' }}>Admin</span>
          <span onClick={() => router.push('/kitchen/login')} style={{ cursor: 'pointer' }}>Kitchen</span>
        </div>
      </div>
    </div>
  );
}
