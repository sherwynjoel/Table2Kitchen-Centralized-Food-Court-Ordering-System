"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';

export default function AdminDashboard() {
    const router = useRouter();
    const { socket } = useSocket();
    const [stats, setStats] = useState({ orders: 0, revenue: 0, kitchens: 0 });
    const [alerts, setAlerts] = useState<string[]>([]);

    useEffect(() => {
        socket.on('staff-alert', (data) => {
            const msg = `Table ${data.table} needs assistance!`;
            setAlerts(prev => [msg, ...prev]);
            // Auto remove after 10s
            setTimeout(() => setAlerts(prev => prev.filter(a => a !== msg)), 10000);
            // Play sound
            new Audio('/alert.mp3').play().catch(() => { });
        });

        return () => { socket.off('staff-alert'); };
    }, [socket]);

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            router.push('/admin/login');
            return;
        }

        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data));

    }, [router]);


    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => router.push('/')}>Home</button>
                    <button className="btn btn-ghost" onClick={() => { localStorage.removeItem('isAdmin'); router.push('/admin/login'); }}>Logout</button>
                </div>
            </header>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="flex-col" style={{ marginBottom: '2rem' }}>
                    {alerts.map((alert, i) => (
                        <div key={i} className="glass-card" style={{ background: 'var(--error)', color: 'white', fontWeight: 'bold' }}>
                            🔔 {alert}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="glass-card flex-col">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Total Revenue</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        ₹{stats.revenue.toFixed(2)}
                    </div>
                </div>
                <div className="glass-card flex-col">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Total Orders</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats.orders}
                    </div>
                </div>
                <div className="glass-card flex-col">
                    <h3 style={{ color: 'var(--text-secondary)' }}>Active Kitchens</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {stats.kitchens}
                    </div>
                </div>
            </div>

            {/* Management Links */}
            <div className="grid-cols-2">
                <div
                    onClick={() => router.push('/admin/menu')}
                    className="glass-card flex-center flex-col"
                    style={{ cursor: 'pointer', height: '200px', border: '1px solid var(--primary)' }}
                >
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍔</span>
                    <h2>Manage Menu</h2>
                    <p>Add products, update prices, edit availability</p>
                </div>
                <div
                    onClick={() => router.push('/admin/kitchens')}
                    className="glass-card flex-center flex-col"
                    style={{ cursor: 'pointer', height: '200px', border: '1px solid var(--secondary)' }}
                >
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🍳</span>
                    <h2>Manage Kitchens</h2>
                    <p>Create new kitchen logins, view staff performance</p>
                </div>
                <div
                    onClick={() => router.push('/admin/tables')}
                    className="glass-card flex-center flex-col"
                    style={{ cursor: 'pointer', height: '200px', border: '1px solid var(--success)' }}
                >
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</span>
                    <h2>Live Tables</h2>
                    <p>Monitor active tables and bills</p>
                </div>
            </div>
        </div>
    );
}
