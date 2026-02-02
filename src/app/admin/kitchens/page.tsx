"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKitchens() {
    const router = useRouter();
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Create Form
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Edit Password State
    const [editId, setEditId] = useState<number | null>(null);
    const [newPass, setNewPass] = useState('');

    useEffect(() => {
        loadKitchens();
    }, []);

    const loadKitchens = () => {
        fetch('/api/admin/kitchens').then(res => res.json()).then(setKitchens);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/kitchens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        if (res.ok) {
            setIsModalOpen(false);
            setName(''); setUsername(''); setPassword('');
            loadKitchens();
        } else {
            alert('Failed to create. Username might be taken.');
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/kitchens', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editId, password: newPass })
        });

        if (res.ok) {
            alert('Password updated successfully!');
            setEditId(null);
            setNewPass('');
            loadKitchens();
        } else {
            alert('Update failed');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        // Default to true if undefined
        const newStatus = !(currentStatus ?? true);

        // Optimistic UI
        setKitchens(prev => prev.map(k => k.id === id ? { ...k, isActive: newStatus } : k));

        await fetch('/api/admin/kitchens', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isActive: newStatus })
        });
        // We don't verify success here to keep UI snappy, usually works.
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this kitchen? All related products and orders might get affected/deleted.')) return;
        await fetch(`/api/admin/kitchens?id=${id}`, { method: 'DELETE' });
        setKitchens(prev => prev.filter(k => k.id !== id));
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => router.push('/admin/dashboard')}>← Back</button>
                    <h1>Kitchen Management</h1>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ New Kitchen</button>
            </header>

            <div className="grid-cols-2" style={{ gap: '1rem' }}>
                {kitchens.map(k => (
                    <div key={k.id} className="glass-card flex-between">
                        <div>
                            <h3>{k.name}</h3>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                <div>Username: <strong>{k.username}</strong></div>
                                <div>Password: <strong>{k.password}</strong></div>
                                <div>Orders Processed: {k._count?.subOrders || 0}</div>
                            </div>
                        </div>
                        <div className="flex-col" style={{ gap: '0.5rem' }}>
                            <button onClick={() => { setEditId(k.id); setNewPass(k.password); }} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
                                ✎ Edit
                            </button>
                            <button
                                onClick={() => handleToggleStatus(k.id, k.isActive)}
                                className="btn btn-ghost"
                                style={{
                                    border: '1px solid var(--border)',
                                    color: (k.isActive === false) ? 'orange' : 'var(--success)',
                                    fontWeight: 'bold'
                                }}
                            >
                                {(k.isActive === false) ? '▶ Resume' : '⏸ Pause'}
                            </button>
                            <button onClick={() => handleDelete(k.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '350px', background: 'var(--surface)' }}>
                        <h2>Add New Kitchen</h2>
                        <form onSubmit={handleCreate} className="flex-col" style={{ marginTop: '1rem' }}>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Kitchen Name" className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)', width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)', width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }} />

                            <div className="flex-between" style={{ marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Password Modal */}
            {editId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '350px', background: 'var(--surface)' }}>
                        <h2>Change Password</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Enter new password for this kitchen.</p>
                        <form onSubmit={handleUpdatePassword} className="flex-col">
                            <input
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="New Password"
                                className="glass"
                                required
                                style={{ padding: '0.8rem', color: 'var(--text-primary)', width: '100%', marginBottom: '1rem', boxSizing: 'border-box' }}
                            />
                            <div className="flex-between">
                                <button type="button" onClick={() => setEditId(null)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
