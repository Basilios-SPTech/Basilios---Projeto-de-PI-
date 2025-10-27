import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Imagem</span>
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <span className='text-sm text-gray-600 mt-1'> {item.description} </span>
                <p className="text-sm text-gray-600 mt-1">R$ {item.price.toFixed(2)}</p>

                <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>

            <div className="text-right">
                <p className="font-semibold text-gray-900">
                    R$ {(item.price * item.quantity).toFixed(2)}
                </p>
            </div>
        </div>
    );
}