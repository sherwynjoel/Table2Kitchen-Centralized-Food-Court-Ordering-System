"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';

export default function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { socket } = useSocket();
    const [order, setOrder] = useState<any>(null);

    const fetchOrder = () => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => setOrder(data));
    };

    useEffect(() => {
        fetchOrder();

        // Listen for live updates
        socket.on(`order-update-${id}`, (updatedOrder) => {
            // Simple reload or merge
            fetchOrder();
        });

        return () => {
            socket.off(`order-update-${id}`);
        }
    }, [id]);

    if (!order) return <div className="flex-center" style={{ height: '100vh' }}>Loading Order #{id}...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'var(--text-secondary)';
            case 'PREPARING': return 'var(--warning)';
            case 'READY': return 'var(--success)';
            default: return 'var(--text-primary)';
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header className="flex-center flex-col" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h1>Order #{order.id}</h1>
                <p>Table {order.tableNumber} • Total ${order.totalAmount.toFixed(2)}</p>
            </header>

            <div className="flex-col">
                {order.subOrders.map((sub: any) => (
                    <div key={sub.id} className="glass-card" style={{ borderLeft: `4px solid ${getStatusColor(sub.status)}` }}>
                        <div className="flex-between">
                            <h3 style={{ fontSize: '1.2rem' }}>{sub.kitchen.name}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                background: getStatusColor(sub.status),
                                color: sub.status === 'PREPARING' ? 'black' : 'white',
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                            }}>
                                {sub.status}
                            </span>
                        </div>
                        <div style={{ marginTop: '1rem', opacity: 0.8 }}>
                            {/* Filter items belonging to this kitchen/suborder could be done here if we linked properly in backend, 
                        or we can infer. For simplicity, just showing status per kitchen. 
                    */}
                            <p style={{ fontSize: '0.9rem' }}>Kitchen is working on your items.</p>
                        </div>
                    </div>
                ))}

                <div className="glass-card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h3>Need Help?</h3>
                    <button
                        onClick={() => {
                            socket.emit('call-staff', { table: order.tableNumber });
                            alert('Staff has been notified!');
                        }}
                        className="btn btn-ghost"
                        style={{ marginTop: '0.5rem' }}
                    >
                        Call Staff
                    </button>
                </div>

                <button onClick={() => router.push(`/menu?table=${order.tableNumber}`)} className="btn btn-ghost" style={{ marginTop: '1rem' }}>
                    Order More Items
                </button>
                <button onClick={() => router.push(`/order/${order.id}/invoice`)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    View Invoice
                </button>
            </div>
        </div>
    );
}
