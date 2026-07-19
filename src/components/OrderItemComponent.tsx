"use client";

import Image from "next/image";
import type { OrderItem } from "@/lib/api";

interface OrderItemComponentProps {
  item: OrderItem;
}

export function OrderItemComponent({ item }: OrderItemComponentProps) {
  return (
    <div className="flex gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="relative w-24 h-24 flex-shrink-0">
        {item.productImageUrl && (
          <Image
            src={item.productImageUrl}
            alt={item.productName || "Product"}
            fill
            className="object-cover rounded-lg"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {item.productName || "Unknown Product"}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Qty:</span>
            <span className="inline-block px-2 py-1 bg-slate-700 text-slate-200 rounded text-sm font-semibold">
              {item.quantity}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Unit Price</div>
            <div className="text-lg font-bold text-white">
              ${item.price.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Subtotal</div>
            <div className="text-lg font-bold text-purple-400">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
