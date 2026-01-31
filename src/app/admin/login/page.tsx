"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded check for MVP. In production, use value from DB/Env.
        if (password === 'admin123') {
            localStorage.setItem('isAdmin', 'true');
            router.push('/admin/dashboard');
        } else {
            setError('Invalid Admin Password');
        }
    };

    return (
        <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
            <div className="glass-card" style={{ width: '300px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Admin Access</h1>
                <form onSubmit={handleLogin} className="flex-col">
                    <input
                        type="password"
                        className="glass"
                        placeholder="Enter Admin PIN"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '0.8rem', outline: 'none', color: 'white', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}
                    />
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}
                    <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Unlock Panel</button>
                </form>
            </div>
        </div>
    );
}
