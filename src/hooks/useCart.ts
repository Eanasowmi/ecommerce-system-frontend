import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import * as cartSlice from "@/store/slices/cartSlice";
import { cartApi } from "@/lib/api-client";
import type { CartItem } from "@/types";

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, total } = useSelector(
    (state: RootState) => state.cart
  );

  const fetchCart = useCallback(async () => {
    dispatch(cartSlice.setLoading(true));
    try {
      const response = await cartApi.getCart();
      dispatch(cartSlice.setCart(response.data as CartItem[]));
      dispatch(cartSlice.setLoading(false));
      return { success: true };
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || "Failed to fetch cart";
      dispatch(cartSlice.setError(message));
      dispatch(cartSlice.setLoading(false));
      return { success: false, error: message };
    }
  }, [dispatch]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      dispatch(cartSlice.setLoading(true));
      try {
        const response = await cartApi.addToCart(productId, quantity);
        dispatch(cartSlice.addItem(response.data as CartItem));
        dispatch(cartSlice.setError(null));
        dispatch(cartSlice.setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to add to cart";
        dispatch(cartSlice.setError(message));
        dispatch(cartSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const updateCartItem = useCallback(
    async (itemId: string, quantity: number) => {
      dispatch(cartSlice.setLoading(true));
      try {
        await cartApi.updateCartItem(itemId, quantity);
        dispatch(cartSlice.updateItem({ id: itemId, quantity }));
        dispatch(cartSlice.setError(null));
        dispatch(cartSlice.setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to update cart";
        dispatch(cartSlice.setError(message));
        dispatch(cartSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      dispatch(cartSlice.setLoading(true));
      try {
        await cartApi.removeFromCart(itemId);
        dispatch(cartSlice.removeItem(itemId));
        dispatch(cartSlice.setError(null));
        dispatch(cartSlice.setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to remove item";
        dispatch(cartSlice.setError(message));
        dispatch(cartSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const clearCart = useCallback(async () => {
    dispatch(cartSlice.setLoading(true));
    try {
      await cartApi.clearCart();
      dispatch(cartSlice.clearCart());
      dispatch(cartSlice.setError(null));
      dispatch(cartSlice.setLoading(false));
      return { success: true };
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || "Failed to clear cart";
      dispatch(cartSlice.setError(message));
      dispatch(cartSlice.setLoading(false));
      return { success: false, error: message };
    }
  }, [dispatch]);

  return {
    items,
    isLoading,
    error,
    total,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
};
