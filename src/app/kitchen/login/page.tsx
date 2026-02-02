"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KitchenLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/kitchen/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('kitchenId', data.id);
            localStorage.setItem('kitchenName', data.name);
            router.push('/kitchen/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
            <div className="glass-card" style={{ width: '300px' }}>
                <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Kitchen Staff</h1>
                <form onSubmit={handleLogin} className="flex-col">
                    <input
                        className="glass"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ padding: '0.8rem', outline: 'none', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
                    />
                    <input
                        className="glass"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '0.8rem', outline: 'none', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
                    />
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</p>}
                    <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Login</button>
                </form>
            </div>
        </div>
    );
}
