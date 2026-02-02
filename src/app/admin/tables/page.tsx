"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTables() {
    const router = useRouter();
    const [tables, setTables] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/admin/tables')
            .then(res => res.json())
            .then(setTables);

        // Auto refresh every 30s
        const interval = setInterval(() => {
            fetch('/api/admin/tables').then(res => res.json()).then(setTables);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Live Tables Monitor</h1>
                <button className="btn btn-ghost" onClick={() => router.push('/admin/dashboard')}>Dashboard</button>
            </header>

            <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {tables.map(t => (
                    <div key={t.tableNumber} className="glass-card flex-col" style={{ borderTop: '4px solid var(--success)' }}>
                        <div className="flex-between">
                            <h2 style={{ fontSize: '2rem' }}>Table {t.tableNumber}</h2>
                            <span className="badge" style={{ background: 'var(--success)', color: 'black', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                                {t.status}
                            </span>
                        </div>

                        <div style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
                            <p>Seated: {new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Orders: {t.activeOrdersCount}</p>
                            <p>Items: {t.itemsCount}</p>
                        </div>

                        <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Bill: ₹{t.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {tables.length === 0 && (
                <div className="flex-center" style={{ height: '50vh', opacity: 0.5, flexDirection: 'column' }}>
                    <h2>No Active Tables</h2>
                    <p>Tables will appear here when customers place orders.</p>
                </div>
            )}
        </div>
    );
}
