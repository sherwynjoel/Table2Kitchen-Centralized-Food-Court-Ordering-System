'use client';

import { useState, useEffect } from 'react';

export default function IPGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked'>('loading');
    const [info, setInfo] = useState<{ allowedIp: string | null, currentIp: string } | null>(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        checkIP();
    }, []);

    const checkIP = async () => {
        try {
            const res = await fetch('/api/system/ip-check');
            const data = await res.json();
            setInfo(data);
            if (data.isMatch) {
                setStatus('allowed');
            } else {
                setStatus('blocked');
            }
        } catch (e) {
            console.error(e);
            setStatus('allowed'); // Fallback to allow if API fails? Or block? Allow for safety against bugs.
        }
    };

    const handleUnlock = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await fetch('/api/system/ip-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, ip: info?.currentIp })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg('Success! Updating network...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setMsg(data.error || 'Failed');
            }
        } catch (e) {
            setMsg('Error connecting');
        }
        setLoading(false);
    };

    if (status === 'loading') {
        // Simple loading spinner or just null
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Security Check...</div>;
    }

    if (status === 'allowed') {
        return <>{children}</>;
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa',
            fontFamily: 'sans-serif',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h1 style={{ color: '#dc3545', fontSize: '3rem', margin: 0 }}>🚫</h1>
            <h1 style={{ color: '#343a40', marginTop: '1rem' }}>Network Restricted</h1>
            <p style={{ color: '#6c757d', maxWidth: '500px', lineHeight: '1.6' }}>
                Access to this application is restricted to the <strong>Food Court Wi-Fi</strong>.
                <br />
                Your Current IP: <code style={{ background: '#e9ecef', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{info?.currentIp}</code>
            </p>

            <div style={{
                marginTop: '2rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Admin Unlock</h3>
                <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
                    Using the correct network? Enter Master Password to update the allowed IP address.
                </p>
                <input
                    type="password"
                    placeholder="Master Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        border: '1px solid #ced4da',
                        borderRadius: '6px',
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    onClick={handleUnlock}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0d6efd',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Updating...' : `Authorize IP: ${info?.currentIp}`}
                </button>
                {msg && <p style={{ color: msg.includes('Success') ? 'green' : 'red', marginTop: '1rem' }}>{msg}</p>}
            </div>
        </div>
    );
}
