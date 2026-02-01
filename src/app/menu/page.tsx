"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function MenuContent() {
    const searchParams = useSearchParams();
    const table = searchParams.get('table');
    const router = useRouter();
    const { addToCart, cart, totalAmount } = useCart();
    const [products, setProducts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!table) router.push('/');

        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data));
    }, [table, router]);

    const uniqueKitchens = ['All', ...new Set(products.map(p => p.kitchen.name))];
    const filteredProducts = activeTab === 'All'
        ? products
        : products.filter(p => p.kitchen.name === activeTab);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Table {table}</h2>
                    <h1>Food Court Menu</h1>
                </div>
                <div
                    onClick={() => router.push(`/cart?table=${table}`)}
                    className="glass-card flex-center"
                    style={{ padding: '0.8rem', cursor: 'pointer', position: 'relative' }}
                >
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🛒</span>
                    <span style={{ fontWeight: 'bold' }}>₹{totalAmount.toFixed(2)}</span>
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: '50%', width: '22px', height: '22px',
                            fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </div>
            </header>

            {/* Categories / Kitchens Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                {uniqueKitchens.map((kitchen: any) => (
                    <button
                        key={kitchen}
                        onClick={() => setActiveTab(kitchen)}
                        className={`btn ${activeTab === kitchen ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {kitchen}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {activeTab === 'All' ? (
                <div className="flex-col" style={{ gap: '3rem' }}>
                    {uniqueKitchens.filter((k: any) => k !== 'All').map((kitchen: any) => {
                        const items = products.filter(p => p.kitchen.name === kitchen);
                        if (items.length === 0) return null;
                        return (
                            <div key={kitchen} className="animate-in">
                                <div className="flex-between" style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{kitchen}</h2>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{items.length} items</span>
                                </div>
                                <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                                    {items.map(product => (
                                        <div key={product.id} className="glass-card flex-col" style={{ gap: '0.5rem', justifyContent: 'space-between' }}>
                                            <div style={{
                                                backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', height: '140px',
                                                backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                                border: '1px solid var(--border)'
                                            }}></div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{product.name}</h3>
                                                <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: '0.4rem 0' }}>{product.description}</p>
                                            </div>
                                            <div className="flex-between" style={{ marginTop: 'auto' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.price.toFixed(2)}</span>
                                                <button onClick={() => setSelectedProduct(product)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className="glass-card flex-col" style={{ gap: '0.5rem', justifyContent: 'space-between' }}>
                            <div style={{
                                backgroundColor: 'var(--surface-alt)', borderRadius: 'var(--radius)', height: '140px',
                                backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                border: '1px solid var(--border)'
                            }}></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{product.kitchen.name}</div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{product.name}</h3>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.4', margin: '0.4rem 0' }}>{product.description}</p>
                            </div>
                            <div className="flex-between" style={{ marginTop: 'auto' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.price.toFixed(2)}</span>
                                <button onClick={() => setSelectedProduct(product)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                                    Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: '400px', background: 'var(--surface)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                        <h3>Add to Order</h3>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{selectedProduct.name}</h2>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>₹{selectedProduct.price.toFixed(2)}</p>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Special Instructions</label>
                        <textarea
                            placeholder="e.g. No onions, extra spicy..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ width: '100%', marginBottom: '1.5rem' }}
                        />

                        <div className="flex-between" style={{ gap: '1rem' }}>
                            <button onClick={() => { setSelectedProduct(null); setNotes(''); }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={() => { addToCart(selectedProduct, notes); setSelectedProduct(null); setNotes(''); }} className="btn btn-primary" style={{ flex: 1 }}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ height: '100vh' }}>Loading...</div>}>
            <MenuContent />
        </Suspense>
    )
}
