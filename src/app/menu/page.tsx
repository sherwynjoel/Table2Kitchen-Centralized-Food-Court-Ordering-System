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
                    🛒 <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>${totalAmount.toFixed(2)}</span>
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            background: 'var(--secondary)', color: 'white',
                            borderRadius: '50%', width: '20px', height: '20px',
                            fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </div>
            </header>

            {/* Categories / Kitchens Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
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
            <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {filteredProducts.map(product => (
                    <div key={product.id} className="glass-card flex-col" style={{ gap: '0.5rem', justifyContent: 'space-between' }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '0.5rem', height: '120px',
                            backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center'
                        }}></div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>{product.kitchen.name}</div>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{product.name}</h3>
                            <p style={{ fontSize: '0.85rem', lineHeight: '1.2', margin: '0.2rem 0' }}>{product.description}</p>
                        </div>
                        <div className="flex-between">
                            <span style={{ fontWeight: 'bold' }}>${product.price.toFixed(2)}</span>
                            <button onClick={() => setSelectedProduct(product)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                + Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProduct && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ width: '350px', background: '#1e293b' }}>
                        <h3>Add to Order</h3>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{selectedProduct.name}</h2>
                        <p style={{ marginBottom: '1rem' }}>${selectedProduct.price.toFixed(2)}</p>

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Special Instructions</label>
                        <textarea
                            className="glass"
                            placeholder="e.g. No onions, extra spicy..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', color: 'white', marginBottom: '1rem' }}
                        />

                        <div className="flex-between">
                            <button onClick={() => { setSelectedProduct(null); setNotes(''); }} className="btn btn-ghost">Cancel</button>
                            <button onClick={() => { addToCart(selectedProduct, notes); setSelectedProduct(null); setNotes(''); }} className="btn btn-primary">Add to Cart</button>
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
