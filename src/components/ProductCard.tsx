"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import type { ProductDto } from "@/types";

interface ProductCardProps {
  product: ProductDto;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300"
    >
      <div className="relative h-64 bg-slate-800 overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover hover:scale-110 transition-transform duration-300"
          />
        )}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
          <Link href={`/products/${product.id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100"
            >
              <Eye size={20} />
            </motion.button>
          </Link>
          {onAddToCart && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => onAddToCart(product.id)}
              className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-100"
            >
              <ShoppingCart size={20} />
            </motion.button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">{product.categoryName}</p>
            <h3 className="font-semibold text-white line-clamp-2 hover:text-slate-200">
              <Link href={`/products/${product.id}`}>{product.name}</Link>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-lg font-bold text-white">
                ${product.discountPrice.toFixed(2)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              product.stockQuantity > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
          </span>
          {product.stockQuantity > 0 && onAddToCart && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToCart(product.id)}
              className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-sm font-semibold hover:from-purple-700 hover:to-pink-700"
            >
              Add to Cart
            </motion.button>
          )}
        </div>

        <div className="text-xs text-slate-500">By {product.vendorName}</div>
      </div>
    </motion.div>
  );
}
