"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSocket } from '@/lib/socket';

function CartContent() {
    const searchParams = useSearchParams();
    const table = searchParams.get('table');
    const router = useRouter();
    const { cart, removeFromCart, totalAmount, clearCart } = useCart();
    const { socket } = useSocket();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!table) router.push('/');
    }, [table, router]);

    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableNumber: table, items: cart })
            });

            if (res.ok) {
                const order = await res.json();

                // Notify Kitchens
                socket.emit('new-order', { orderId: order.id, table });

                clearCart();
                router.push(`/order/${order.id}`);
            } else {
                alert('Failed to place order');
            }
        } catch (e) {
            console.error(e);
            alert('Error placing order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <button onClick={() => router.back()} className="btn btn-ghost">← Back</button>
                <h1>Your Cart</h1>
                <div style={{ width: '50px' }}></div>
            </header>

            {cart.length === 0 ? (
                <div className="flex-center flex-col" style={{ height: '50vh', color: 'var(--text-secondary)' }}>
                    <p>Your cart is empty.</p>
                    <button onClick={() => router.push(`/menu?table=${table}`)} className="btn btn-primary">Browse Menu</button>
                </div>
            ) : (
                <div className="flex-col">
                    {cart.map(item => (
                        <div key={item.id} className="glass-card flex-between">
                            <div>
                                <h3 style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{item.kitchenName}</div>
                                <div style={{ marginTop: '0.5rem' }}>${item.price.toFixed(2)} x {item.quantity}</div>
                            </div>
                            <div className="flex-center" style={{ gap: '1rem' }}>
                                <div style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</div>
                                <button onClick={() => removeFromCart(item.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="glass-card" style={{ marginTop: '1rem', border: '1px solid var(--primary)' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                ${totalAmount.toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
                        >
                            {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>Loading...</div>}>
            <CartContent />
        </Suspense>
    )
}
