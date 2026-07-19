import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = calculateTotal(action.payload);
      state.error = null;
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = calculateTotal(state.items);
    },
    updateItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        }
      }
      state.total = calculateTotal(state.items);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    if (item.product) {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }
    // Flat DTO from backend
    if (item.price) {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);
}

export const {
  setLoading,
  setError,
  setCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  clearError,
} = cartSlice.actions;
export default cartSlice.reducer;
