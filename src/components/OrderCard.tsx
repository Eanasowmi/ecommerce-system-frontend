"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Order } from "@/lib/api";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-900/30 text-yellow-200 border-yellow-700";
      case "processing":
        return "bg-blue-900/30 text-blue-200 border-blue-700";
      case "shipped":
        return "bg-purple-900/30 text-purple-200 border-purple-700";
      case "delivered":
        return "bg-green-900/30 text-green-200 border-green-700";
      case "cancelled":
        return "bg-red-900/30 text-red-200 border-red-700";
      default:
        return "bg-slate-900/30 text-slate-200 border-slate-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status.toLowerCase() === "paid"
      ? "bg-green-900/30 text-green-200 border-green-700"
      : "bg-yellow-900/30 text-yellow-200 border-yellow-700";
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-slate-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <ArrowRight className="text-slate-400 hover:text-slate-300" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Payment</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Items</p>
            <p className="font-semibold text-white">{order.items?.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
            <p className="font-semibold text-purple-400">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Method</p>
            <p className="font-semibold text-white text-sm">
              {order.paymentMethod}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
