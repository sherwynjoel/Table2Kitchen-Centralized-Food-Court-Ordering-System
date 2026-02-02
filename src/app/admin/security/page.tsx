'use client';

import { useState, useEffect } from 'react';

export default function SecurityPage() {
    const [info, setInfo] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/system/ip-check').then(res => res.json()).then(setInfo);
    }, []);

    const lockSystem = async () => {
        if (!info) return; // Guard
        const res = await fetch('/api/system/ip-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, ip: info.currentIp })
        });
        if (res.ok) {
            setMsg('System LOCKED to ' + info.currentIp);
            window.location.reload();
        } else {
            setMsg('Failed: Check Password');
        }
    };

    if (!info) return <div className="container" style={{ marginTop: '4rem' }}>Loading Settings...</div>;


    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Security Settings 🛡️</h1>

            <div className="glass-card flex-col">
                <div className="flex-between">
                    <span>Current Status:</span>
                    <span className="badge" style={{ background: info?.isMatch && info?.allowedIp ? 'var(--success)' : (info?.allowedIp ? 'var(--error)' : 'var(--warning)') }}>
                        {info?.allowedIp ? 'LOCKED 🔒' : 'OPEN (Unsafe) 🔓'}
                    </span>
                </div>

                <div className="flex-between">
                    <span>Your IP:</span>
                    <code>{info?.currentIp}</code>
                </div>

                <div className="flex-between">
                    <span>Allowed Network:</span>
                    <code>{info?.allowedIp || 'Any (Not Set)'}</code>
                </div>

                <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                <h3>Lock System</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Enter Master Password to lock the system to your current network ONLY.
                </p>

                <input
                    type="password"
                    placeholder="Master Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <div className="flex-col" style={{ gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={lockSystem} disabled={!info?.currentIp} style={{ width: '100%' }}>
                        {info?.allowedIp ? 'Update Allowed Network (Re-Lock)' : 'LOCK to My Network'}
                    </button>

                    {info?.allowedIp && (
                        <button className="btn btn-ghost" onClick={() => {
                            // Unlock logic: Set Allowed IP to empty
                            fetch('/api/system/ip-check', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password, ip: '' }) // Empty IP means Unlock
                            }).then(() => window.location.reload());
                        }} style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}>
                            🔓 UNLOCK (Allow All)
                        </button>
                    )}
                </div>

                {msg && <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{msg}</p>}
            </div>
        </div>
    );
}
