"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';

export default function KitchenDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const { socket } = useSocket();
    const [kitchenId, setKitchenId] = useState<string | null>(null);
    const [kitchenName, setKitchenName] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('kitchenId');
        if (!id) {
            router.push('/kitchen/login');
            return;
        }
        setKitchenId(id);
        setKitchenName(localStorage.getItem('kitchenName') || '');

        fetchOrders(id);

        // Join room
        socket.emit('join-kitchen', id);

        // Listen for new orders
        // Note: server.ts needs to implement broadcasting to 'kitchen-{id}' room
        socket.on(`new-order-kitchen-${id}`, () => {
            fetchOrders(id);
            // Play sound here
            const audio = new Audio('/alert.mp3'); // Need to add this file
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        return () => {
            socket.off(`new-order-kitchen-${id}`);
        }
    }, [router, socket]);

    const fetchOrders = (id: string) => {
        fetch(`/api/kitchen/orders?id=${id}`)
            .then(res => res.json())
            .then(data => setOrders(data));
    };

    const updateStatus = async (subOrderId: number, currentStatus: string, orderId: number) => {
        const nextStatus = {
            'RECEIVED': 'PREPARING',
            'PREPARING': 'READY',
            'READY': 'SERVED'
        }[currentStatus];

        if (!nextStatus) return;

        await fetch('/api/kitchen/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subOrderId, status: nextStatus })
        });

        // Optimistic update
        fetchOrders(kitchenId!);

        // Notify customer
        socket.emit('order-update', { orderId });
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>{kitchenName} Dashboard</h1>
                <button className="btn btn-ghost" onClick={() => router.push('/')}>Logout</button>
            </header>

            <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {orders.map(sub => (
                    <div key={sub.id} className="glass-card flex-col" style={{
                        borderTop: `4px solid ${sub.status === 'READY' ? 'var(--success)' : 'var(--warning)'}`,
                        opacity: sub.status === 'SERVED' ? 0.5 : 1
                    }}>
                        <div className="flex-between">
                            <h2 style={{ fontSize: '1.5rem' }}>Table {sub.order.tableNumber}</h2>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                #{sub.id} • {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {sub.items.map((item: any) => (
                                <div key={item.id} className="flex-col" style={{ marginBottom: '0.8rem' }}>
                                    <div className="flex-between">
                                        <span style={{ fontWeight: 'bold' }}>{item.quantity}x {item.product.name}</span>
                                    </div>
                                    {item.notes && (
                                        <div style={{ fontSize: '0.85rem', color: '#facc15', marginTop: '0.2rem', paddingLeft: '0.5rem', borderLeft: '2px solid #facc15' }}>
                                            ⚠️ {item.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => updateStatus(sub.id, sub.status, sub.orderId)}
                            className={`btn ${sub.status === 'READY' ? 'btn-ghost' : 'btn-primary'}`}
                            style={{
                                width: '100%',
                                background: sub.status === 'READY' ? 'var(--success)' : undefined
                            }}
                        >
                            {sub.status === 'RECEIVED' && 'Start Cooking'}
                            {sub.status === 'PREPARING' && 'Mark Ready'}
                            {sub.status === 'READY' && 'Complete Order'}
                        </button>
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="flex-center" style={{ height: '50vh', opacity: 0.5 }}>
                    <h2>No active orders</h2>
                </div>
            )}
        </div>
    );
}
