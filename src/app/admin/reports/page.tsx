"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminReports() {
    const router = useRouter();
    const [report, setReport] = useState<any[]>([]);
    const [selectedKitchen, setSelectedKitchen] = useState<any | null>(null);

    useEffect(() => {
        fetch('/api/admin/reports')
            .then(res => res.json())
            .then(setReport);
    }, []);

    const handleSettleClick = (kitchen: any) => {
        setSelectedKitchen(kitchen);
    };

    const confirmPayment = () => {
        if (!selectedKitchen) return;
        alert(`Payment of ₹${selectedKitchen.totalRevenue.toFixed(2)} logged for ${selectedKitchen.name}.`);
        setSelectedKitchen(null);
        // In a real app, we would POST to an api to record this payout transaction.
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => router.back()}>← Back</button>
                    <h1>Kitchen Payout Reports</h1>
                </div>
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print Report</button>
            </header>

            <div className="glass-card flex-col" style={{ padding: '2rem' }}>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Total revenue collected by Admin to be distributed to individual kitchens.
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Kitchen Name</th>
                            <th style={{ padding: '1rem' }}>Total Orders</th>
                            <th style={{ padding: '1rem' }}>Total Revenue Generated</th>
                            <th style={{ padding: '1rem' }}>Payout Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map(row => (
                            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{row.name}</td>
                                <td style={{ padding: '1rem' }}>{row.totalOrders}</td>
                                <td style={{ padding: '1rem', fontSize: '1.2rem' }}>₹{row.totalRevenue.toFixed(2)}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleSettleClick(row)}
                                        disabled={row.totalRevenue === 0}
                                    >
                                        Review & Pay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payout Details Modal */}
            {selectedKitchen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card flex-col" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2>Payout Details: {selectedKitchen.name}</h2>
                            <button className="btn btn-ghost" onClick={() => setSelectedKitchen(null)}>✕</button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', marginBottom: '1rem', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--text-secondary)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '0.5rem' }}>Date & Time</th>
                                        <th style={{ padding: '0.5rem' }}>Order Info</th>
                                        <th style={{ padding: '0.5rem' }}>Items Served</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedKitchen.details.map((detail: any) => (
                                        <tr key={detail.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-secondary)' }}>
                                                {new Date(detail.date).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.8rem 0.5rem' }}>
                                                <strong>#{detail.orderId}</strong>
                                                <div style={{ fontSize: '0.8rem' }}>Table {detail.table}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem 0.5rem' }}>{detail.items}</td>
                                            <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                                                ₹{detail.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex-between" style={{ marginTop: '1rem', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                            <h3>Total Payout Amount</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{selectedKitchen.totalRevenue.toFixed(2)}</div>
                        </div>

                        <div className="flex-end" style={{ gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-ghost" onClick={() => setSelectedKitchen(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmPayment}>Confirm Payment to {selectedKitchen.name}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
