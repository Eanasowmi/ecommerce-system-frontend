import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import * as ordersSlice from "@/store/slices/ordersSlice";
import { orderApi } from "@/lib/api-client";
import type { OrderDto } from "@/types";

export const useOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, selectedOrder, isLoading, error } = useSelector(
    (state: RootState) => state.orders
  );

  const fetchMyOrders = useCallback(async () => {
    dispatch(ordersSlice.setLoading(true));
    try {
      const response = await orderApi.getMyOrders();
      dispatch(ordersSlice.setOrders(response.data as OrderDto[]));
      dispatch(ordersSlice.setLoading(false));
      return { success: true };
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || "Failed to fetch orders";
      dispatch(ordersSlice.setError(message));
      dispatch(ordersSlice.setLoading(false));
      return { success: false, error: message };
    }
  }, [dispatch]);

  const fetchOrderById = useCallback(
    async (id: string) => {
      dispatch(ordersSlice.setLoading(true));
      try {
        const response = await orderApi.getOrderById(id);
        dispatch(ordersSlice.setSelectedOrder(response.data as OrderDto));
        dispatch(ordersSlice.setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to fetch order";
        dispatch(ordersSlice.setError(message));
        dispatch(ordersSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const checkout = useCallback(
    async (paymentMethod: string, shippingAddress: string) => {
      dispatch(ordersSlice.setLoading(true));
      try {
        const response = await orderApi.checkout(paymentMethod, shippingAddress);
        dispatch(ordersSlice.addOrder(response.data as OrderDto));
        dispatch(ordersSlice.setError(null));
        dispatch(ordersSlice.setLoading(false));
        return { success: true, order: response.data as OrderDto };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Checkout failed";
        dispatch(ordersSlice.setError(message));
        dispatch(ordersSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const fetchAllOrders = useCallback(async () => {
    dispatch(ordersSlice.setLoading(true));
    try {
      const response = await orderApi.getAllOrders();
      dispatch(ordersSlice.setOrders(response.data as OrderDto[]));
      dispatch(ordersSlice.setLoading(false));
      return { success: true };
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || "Failed to fetch orders";
      dispatch(ordersSlice.setError(message));
      dispatch(ordersSlice.setLoading(false));
      return { success: false, error: message };
    }
  }, [dispatch]);

  const updateOrderStatus = useCallback(
    async (id: string, status: string) => {
      dispatch(ordersSlice.setLoading(true));
      try {
        const response = await orderApi.updateOrderStatus(id, status);
        dispatch(ordersSlice.updateOrder(response.data as OrderDto));
        dispatch(ordersSlice.setError(null));
        dispatch(ordersSlice.setLoading(false));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to update order";
        dispatch(ordersSlice.setError(message));
        dispatch(ordersSlice.setLoading(false));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  return {
    orders,
    selectedOrder,
    isLoading,
    error,
    fetchMyOrders,
    fetchOrderById,
    checkout,
    fetchAllOrders,
    updateOrderStatus,
  };
};
