"use client";

import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem } from "@/lib/api";

interface CartItemComponentProps {
  item: CartItem;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemove?: (itemId: string) => void;
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemComponentProps) {
  const total = item.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="relative w-24 h-24 flex-shrink-0">
        {item.productImageUrl && (
          <Image
            src={item.productImageUrl}
            alt={item.productName}
            fill
            className="object-cover rounded-lg"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-white hover:text-slate-200">
            {item.productName}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))
              }
              className="p-1 hover:bg-slate-700 rounded-md transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={16} className="text-slate-300" />
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                onUpdateQuantity?.(item.id, Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-12 text-center bg-slate-700 text-white rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
              className="p-1 hover:bg-slate-700 rounded-md transition-colors"
            >
              <Plus size={16} className="text-slate-300" />
            </button>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-white">${total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onRemove?.(item.id)}
        className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
