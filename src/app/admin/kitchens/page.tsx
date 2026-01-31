"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKitchens() {
    const router = useRouter();
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetch('/api/admin/kitchens').then(res => res.json()).then(setKitchens);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/kitchens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        if (res.ok) {
            setIsModalOpen(false);
            setName('');
            setUsername('');
            setPassword('');
            // Refresh
            fetch('/api/admin/kitchens').then(res => res.json()).then(setKitchens);
        } else {
            alert('Failed to create. Username might be taken.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this kitchen? All related products and orders might get affected/deleted.')) return;
        await fetch(`/api/admin/kitchens?id=${id}`, { method: 'DELETE' });
        setKitchens(prev => prev.filter(k => k.id !== id));
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Kitchen Management</h1>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => router.push('/admin/dashboard')}>Dashboard</button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ New Kitchen</button>
                </div>
            </header>

            <div className="grid-cols-2">
                {kitchens.map(k => (
                    <div key={k.id} className="glass-card flex-between">
                        <div>
                            <h3>{k.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Login: {k.username}</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Orders Processed: {k._count?.subOrders || 0}</p>
                        </div>
                        <button onClick={() => handleDelete(k.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '350px', background: '#1e293b' }}>
                        <h2>Add New Kitchen</h2>
                        <form onSubmit={handleCreate} className="flex-col" style={{ marginTop: '1rem' }}>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="Kitchen Name (e.g. Burger King)" className="glass" required style={{ padding: '0.8rem', color: 'white' }} />
                            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="glass" required style={{ padding: '0.8rem', color: 'white' }} />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="glass" required style={{ padding: '0.8rem', color: 'white' }} />

                            <div className="flex-between" style={{ marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
