"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
    const router = useRouter();
    const { socket } = useSocket();
    const [stats, setStats] = useState({ orders: 0, revenue: 0, kitchens: 0 });
    const [analytics, setAnalytics] = useState({ salesTrend: [], salesByKitchen: [] });
    const [alerts, setAlerts] = useState<string[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    useEffect(() => {
        socket.on('staff-alert', (data) => {
            const msg = `Table ${data.table} needs assistance!`;
            setAlerts(prev => [msg, ...prev]);
            // Auto remove after 10s
            setTimeout(() => setAlerts(prev => prev.filter(a => a !== msg)), 10000);
            // Play sound
            new Audio('/alert.mp3').play().catch(() => { });
        });

        socket.on('order-update', () => {
            fetch('/api/admin/orders').then(res => res.json()).then(setOrders);
            fetch('/api/admin/stats').then(res => res.json()).then(setStats);
            fetch('/api/admin/analytics').then(res => res.json()).then(setAnalytics);
        });

        return () => {
            socket.off('staff-alert');
            socket.off('order-update');
        };
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

        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(data => setAnalytics(data));

        fetch('/api/admin/orders')
            .then(res => res.json())
            .then(setOrders);

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

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(300px, 1fr)', gap: '2rem', alignItems: 'start' }}>
                {/* LEFT COLUMN: Main Dashboard */}
                <div className="flex-col">
                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <div className="flex-col" style={{ marginBottom: '2rem' }}>
                            {alerts.map((alert, i) => (
                                <div key={i} className="glass-card" style={{
                                    background: 'var(--surface)',
                                    color: 'var(--text-primary)',
                                    fontWeight: 'bold',
                                    borderLeft: '4px solid var(--error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ width: '8px', height: '8px', background: 'red', borderRadius: '50%' }}></div>
                                    {alert}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
                        <div className="glass-card flex-col">
                            <h3 style={{ color: 'var(--text-secondary)' }}>Total Revenue</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                                ₹{stats.revenue.toFixed(2)}
                            </div>
                        </div>
                        <div className="glass-card flex-col">
                            <h3 style={{ color: 'var(--text-secondary)' }}>Total Orders</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                                {stats.orders}
                            </div>
                        </div>
                        <div className="glass-card flex-col">
                            <h3 style={{ color: 'var(--text-secondary)' }}>Active Kitchens</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                                {stats.kitchens}
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid-cols-2" style={{ marginBottom: '2rem', gap: '1rem' }}>
                        <div className="glass-card flex-col">
                            <h3>Revenue Trend (Last 7 Days)</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={analytics.salesTrend}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ff7e67" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ff7e67" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip
                                            contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
                                            itemStyle={{ color: '#000' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#ff7e67" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card flex-col">
                            <h3>Orders by Kitchen</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer>
                                    <BarChart data={analytics.salesByKitchen} layout="vertical">
                                        <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" width={100} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <Bar dataKey="orders" fill="#ff7e67" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Management Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div
                            onClick={() => router.push('/admin/menu')}
                            className="glass-card flex-center flex-col"
                            style={{
                                cursor: 'pointer', height: '180px', textAlign: 'center',
                                justifyContent: 'center', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)'
                            }}></div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Manage Menu</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Add products, prices</p>
                            <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>→</div>
                        </div>
                        <div
                            onClick={() => router.push('/admin/kitchens')}
                            className="glass-card flex-center flex-col"
                            style={{
                                cursor: 'pointer', height: '180px', textAlign: 'center',
                                justifyContent: 'center', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)'
                            }}></div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Kitchens</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Staff Logins</p>
                            <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>→</div>
                        </div>
                        <div
                            onClick={() => router.push('/admin/tables')}
                            className="glass-card flex-center flex-col"
                            style={{
                                cursor: 'pointer', height: '180px', textAlign: 'center',
                                justifyContent: 'center', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)'
                            }}></div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Live Tables</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Monitor Activity</p>
                            <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>→</div>
                        </div>
                        <div
                            onClick={() => router.push('/admin/reports')}
                            className="glass-card flex-center flex-col"
                            style={{
                                cursor: 'pointer', height: '180px', textAlign: 'center',
                                justifyContent: 'center', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)'
                            }}></div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reports</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Kitchen Payouts</p>
                            <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>→</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Order History Sidebar */}
                <div className="glass-card flex-col" style={{ height: 'calc(100vh - 150px)', overflowY: 'auto', position: 'sticky', top: '1rem', padding: '1rem' }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Recent Activity</h2>
                    <div className="flex-col" style={{ gap: '1rem' }}>
                        {orders.map(order => {
                            // Compute Status Dynamically
                            const isCompleted = order.subOrders.length > 0 && order.subOrders.every((s: any) => s.status === 'SERVED');
                            const anyActive = order.subOrders.some((s: any) => ['PREPARING', 'READY', 'SERVED'].includes(s.status));
                            const displayStatus = isCompleted ? 'COMPLETED' : anyActive ? 'IN_PROGRESS' : 'PENDING';
                            const statusColor = displayStatus === 'COMPLETED' ? 'var(--success)' : displayStatus === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--text-secondary)';

                            return (
                                <div key={order.id} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <div
                                        className="flex-between"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                    >
                                        <div className="flex-center" style={{ gap: '0.5rem' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                                            }}>
                                                {order.tableNumber}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>#{order.id}</div>
                                            </div>
                                        </div>
                                        <div className="flex-center" style={{ gap: '0.5rem' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{order.totalAmount}</div>
                                            <div style={{ fontSize: '0.8rem' }}>{expandedOrderId === order.id ? '▲' : '▼'}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                        {new Date(order.createdAt).toLocaleTimeString()} • <span style={{ color: statusColor, fontWeight: 'bold' }}>{displayStatus}</span>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedOrderId === order.id && (
                                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                            <div style={{ fontSize: '0.8rem' }}>
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} style={{ margin: '0.1rem 0' }}>
                                                        {item.quantity}x {item.product.name}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '0.5rem' }}>
                                                {order.subOrders.map((sub: any) => (
                                                    <div key={sub.id} className="flex-between" style={{ fontSize: '0.75rem', margin: '0.1rem 0', color: 'var(--text-secondary)' }}>
                                                        <span>{sub.kitchen.name}</span>
                                                        <span style={{
                                                            fontWeight: 'bold',
                                                            color: (sub.status === 'READY' || sub.status === 'SERVED') ? 'var(--success)' :
                                                                sub.status === 'PREPARING' ? 'var(--warning)' : 'var(--error)'
                                                        }}>
                                                            {sub.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
