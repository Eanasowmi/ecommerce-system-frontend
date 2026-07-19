import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { OrderDto } from "@/types";

interface OrdersState {
  orders: OrderDto[];
  selectedOrder: OrderDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOrders: (state, action: PayloadAction<OrderDto[]>) => {
      state.orders = action.payload;
      state.error = null;
    },
    setSelectedOrder: (state, action: PayloadAction<OrderDto | null>) => {
      state.selectedOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<OrderDto>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<OrderDto>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setOrders,
  setSelectedOrder,
  addOrder,
  updateOrder,
  clearError,
} = ordersSlice.actions;
export default ordersSlice.reducer;
