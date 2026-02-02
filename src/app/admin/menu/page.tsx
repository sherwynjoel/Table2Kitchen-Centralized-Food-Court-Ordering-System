"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMenu() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (editingProduct) {
            setImageUrl(editingProduct.image || '');
        } else {
            setImageUrl('');
        }
    }, [editingProduct]);

    const handleUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) setImageUrl(data.url);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetch('/api/products').then(res => res.json()).then(setProducts);
        // Fetch kitchens list (using the stats/kitchens api logic or new endpoint. 
        // For simplicity, we can inspect unique kitchens from products or assume hardcoded list for now, 
        // but better to fetch proper list. Let's assume we implement a kitchen fetcher or reusing existing product data to get kitchens.)
        // Actually, let's just make a quick Kitchen API endpoint or just assume standard ones for MVP Demo
        // Or better, let's fetch products and extract unique kitchens + ID map if available.
        // However, for adding new items, we need kitchen IDs. 
        // For MVP, I will hardcode the kitchen fetch or assume user knows ID.
        // IMPROVEMENT: Fetch kitchens properly.
        // I'll add a quick fetch for kitchens here.
        fetch('/api/admin/kitchens').then(res => res.json()).then(setKitchens).catch(console.error);
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);

        const method = editingProduct ? 'PUT' : 'POST';
        const body = editingProduct ? { ...data, id: editingProduct.id } : data;

        const res = await fetch('/api/admin/products', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            setIsModalOpen(false);
            setEditingProduct(null);
            // Refresh list
            fetch('/api/products').then(res => res.json()).then(setProducts);
        }
    };

    return (
        <div className="container">
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1>Menu Management</h1>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={() => router.push('/admin/dashboard')}>Dashboard</button>
                    <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>+ Add Product</button>
                </div>
            </header>

            <div className="grid-cols-2">
                {products.map(p => (
                    <div key={p.id} className="glass-card flex-between">
                        <div className="flex-center" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '0.5rem',
                                backgroundColor: '#eee', backgroundImage: `url(${p.image})`, backgroundSize: 'cover'
                            }}></div>
                            <div>
                                <h3>{p.name}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{p.kitchen.name} • ₹{p.price}</div>
                            </div>
                        </div>
                        <div className="flex-col" style={{ gap: '0.5rem' }}>
                            <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem' }}>Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem', color: 'var(--error)' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '400px', background: 'var(--surface)' }}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSave} className="flex-col" style={{ marginTop: '1rem' }}>
                            <input name="name" defaultValue={editingProduct?.name} placeholder="Product Name" className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)' }} />
                            <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} placeholder="Price" className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)' }} />
                            <input name="description" defaultValue={editingProduct?.description} placeholder="Description" className="glass" style={{ padding: '0.8rem', color: 'var(--text-primary)' }} />
                            <div className="flex-col" style={{ gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Product Image</label>
                                <div className="flex-center" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
                                    {imageUrl && (
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '0.5rem',
                                            backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover',
                                            border: '1px solid var(--border)'
                                        }}></div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        className="glass"
                                        style={{ padding: '0.5rem', width: 'auto' }}
                                    />
                                    {uploading && <span style={{ fontSize: '0.8rem' }}>Uploading...</span>}
                                </div>
                                <input type="hidden" name="image" value={imageUrl} />
                            </div>

                            <select name="kitchenId" defaultValue={editingProduct?.kitchenId} className="glass" required style={{ padding: '0.8rem', color: 'var(--text-primary)' }}>
                                <option value="">Select Kitchen</option>
                                {kitchens.map((k: any) => (
                                    <option key={k.id} value={k.id}>{k.name}</option>
                                ))}
                            </select>

                            <div className="flex-between" style={{ marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
