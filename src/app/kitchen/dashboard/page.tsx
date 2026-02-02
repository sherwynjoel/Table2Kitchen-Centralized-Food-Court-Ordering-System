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

    // State for Stock Management
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [myProducts, setMyProducts] = useState<any[]>([]);

    // Audio & Timer Logic
    useEffect(() => {
        // Interval to update timers every minute (force re-render)
        const timer = setInterval(() => {
            setOrders(prev => [...prev]); // Trigger re-render to update elapsed times
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch My Products
    const fetchMyProducts = () => {
        if (!kitchenId) return;
        fetch(`/api/kitchen/products?id=${kitchenId}`)
            .then(res => res.json())
            .then(setMyProducts);
    };

    const toggleStock = async (productId: number, currentStatus: boolean) => {
        await fetch('/api/kitchen/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, isAvailable: !currentStatus })
        });
        fetchMyProducts(); // Refresh
    };

    // Print Logic
    const printOrder = (sub: any) => {
        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <body style="font-family: monospace; width: 280px;">
                    <h2 style="text-align: center;">Table ${sub.order.tableNumber}</h2>
                    <p style="text-align: center;">Order #${sub.id}</p>
                    <hr/>
                    ${sub.items.map((item: any) => `
                        <div style="display: flex; justify-content: space-between;">
                            <span>${item.quantity}x ${item.product.name}</span>
                        </div>
                        ${item.notes ? `<small>Note: ${item.notes}</small>` : ''}
                        <br/>
                    `).join('')}
                    <hr/>
                    <p>Time: ${new Date(sub.createdAt).toLocaleTimeString()}</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    // Helper: Calculate Time Color
    const getTimeColor = (createdAt: string) => {
        const elapsed = (new Date().getTime() - new Date(createdAt).getTime()) / 60000; // minutes
        if (elapsed > 15) return 'var(--error)';
        if (elapsed > 10) return 'var(--warning)';
        return 'var(--success)';
    };

    const getElapsedStr = (createdAt: string) => {
        const elapsed = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
        return `${elapsed}m ago`;
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <h1>{kitchenName} Dashboard</h1>
                    <button className="btn btn-ghost" onClick={() => { fetchMyProducts(); setIsMenuOpen(true); }} style={{ fontSize: '0.9rem' }}>📦 My Stocks</button>
                </div>
                <button className="btn btn-ghost" onClick={() => router.push('/')}>Logout</button>
            </header>

            <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {orders.map(sub => (
                    <div key={sub.id} className="glass-card flex-col" style={{
                        borderTop: 'none',
                        border: '1px solid var(--border)',
                        opacity: sub.status === 'SERVED' ? 0.5 : 1,
                        position: 'relative'
                    }}>
                        {/* Timer Badge */}
                        {sub.status !== 'SERVED' && (
                            <div style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: getTimeColor(sub.createdAt),
                                color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                            }}>
                                ⏱️ {getElapsedStr(sub.createdAt)}
                            </div>
                        )}

                        <div className="flex-between">
                            <h2 style={{ fontSize: '1.5rem' }}>Table {sub.order.tableNumber}</h2>
                        </div>

                        <div className="flex-col" style={{ alignItems: 'flex-start', gap: '0', marginTop: '-0.5rem' }}>
                            <span className="badge" style={{
                                background: sub.status === 'READY' ? 'var(--primary)' : 'var(--surface-alt)',
                                color: sub.status === 'READY' ? 'white' : 'var(--text-primary)',
                                marginBottom: '0.25rem'
                            }}>
                                {sub.status}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                #{sub.id} • {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>


                        <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                            {sub.items.map((item: any) => (
                                <div key={item.id} className="flex-col" style={{ marginBottom: '0.8rem' }}>
                                    <div className="flex-between">
                                        <span style={{ fontWeight: 'bold' }}>{item.quantity}x {item.product.name}</span>
                                    </div>
                                    {item.notes && (
                                        <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.2rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--primary)' }}>
                                            Note: {item.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex-between" style={{ gap: '0.5rem' }}>
                            <button
                                onClick={() => printOrder(sub)}
                                className="btn btn-ghost"
                                style={{ padding: '0.8rem', width: 'auto' }}
                                title="Print KOT"
                            >🖨️</button>
                            <button
                                onClick={() => updateStatus(sub.id, sub.status, sub.orderId)}
                                className={`btn ${sub.status === 'READY' ? 'btn-ghost' : 'btn-primary'}`}
                                style={{ flex: 1 }}
                            >
                                {sub.status === 'RECEIVED' && 'Start Cooking'}
                                {sub.status === 'PREPARING' && 'Mark Ready'}
                                {sub.status === 'READY' && 'Complete Order'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="flex-center" style={{ height: '50vh', opacity: 0.5 }}>
                    <h2>No active orders</h2>
                </div>
            )}

            {/* Stock Management Modal */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--surface)' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <h2>My Stock</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="btn btn-ghost">✕</button>
                        </div>
                        <div className="flex-col">
                            {myProducts.map(p => (
                                <div key={p.id} className="flex-between" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <div className="flex-center" style={{ gap: '1rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.isAvailable ? 'var(--success)' : 'var(--error)' }}></div>
                                        <span>{p.name}</span>
                                    </div>
                                    <button
                                        onClick={() => toggleStock(p.id, p.isAvailable)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.8rem', color: p.isAvailable ? 'var(--error)' : 'var(--success)' }}
                                    >
                                        {p.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
