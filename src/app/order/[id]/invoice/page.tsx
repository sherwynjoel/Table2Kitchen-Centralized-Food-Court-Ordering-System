"use client";

import { useEffect, useState, use } from 'react';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => setOrder(data));
    }, [id]);

    if (!order) return <div className="flex-center" style={{ height: '100vh' }}>Loading Invoice...</div>;

    return (
        <div className="container" style={{ background: 'white', color: 'black', minHeight: '100vh', padding: '3rem', maxWidth: '800px' }}>
            <div className="flex-between" style={{ borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1>INVOICE</h1>
                    <p>Invoice #: {order.id.toString().padStart(6, '0')}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2>Table2Kitchen</h2>
                    <p>Food Court Central</p>
                    <p>Table Number: {order.tableNumber}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                        <th style={{ padding: '0.8rem' }}>Item</th>
                        <th style={{ padding: '0.8rem' }}>Kitchen</th>
                        <th style={{ padding: '0.8rem' }}>Qty</th>
                        <th style={{ padding: '0.8rem', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '0.8rem', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item: any) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td style={{ padding: '0.8rem' }}>
                                {item.product.name}
                                {item.notes && <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>Note: {item.notes}</div>}
                            </td>
                            <td style={{ padding: '0.8rem' }}>{item.product.kitchen?.name || '-'}</td>
                            <td style={{ padding: '0.8rem' }}>{item.quantity}</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex-col" style={{ alignItems: 'flex-end' }}>
                <div className="flex-between" style={{ width: '250px' }}>
                    <span>Subtotal:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex-between" style={{ width: '250px' }}>
                    <span>Tax (5%):</span>
                    <span>${(order.totalAmount * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex-between" style={{ width: '250px', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem', borderTop: '2px solid #333', paddingTop: '0.5rem' }}>
                    <span>Grand Total:</span>
                    <span>${(order.totalAmount * 1.05).toFixed(2)}</span>
                </div>
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                <p>Thank you for dining with us!</p>
                <button
                    onClick={() => window.print()}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', background: '#333', color: 'white', display: 'inline-block' }}
                >
                    Print Invoice
                </button>
            </div>
        </div>
    );
}
