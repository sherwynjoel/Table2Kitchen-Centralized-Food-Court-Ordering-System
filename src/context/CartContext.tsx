"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
    id: number;
    name: string;
    price: number;
    kitchenId: number;
    kitchenName: string;
    quantity: number;
    notes?: string;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (product: any, notes?: string) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    totalAmount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: any, notes: string = '') => {
        setCart(prev => {
            // Simple logic: If same product AND same notes, increment. Else add new.
            const existing = prev.find(item => item.id === product.id && item.notes === notes);
            if (existing) {
                return prev.map(item =>
                    (item.id === product.id && item.notes === notes) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                kitchenId: product.kitchenId,
                kitchenName: product.kitchen.name,
                quantity: 1,
                notes
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
