import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ProductDto } from "@/types";

interface ProductsState {
  items: ProductDto[];
  selectedProduct: ProductDto | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProducts: (
      state,
      action: PayloadAction<{
        content: ProductDto[];
        totalPages: number;
        totalElements: number;
        number: number;
      }>
    ) => {
      state.items = action.payload.content;
      state.totalPages = action.payload.totalPages;
      state.totalElements = action.payload.totalElements;
      state.currentPage = action.payload.number;
      state.error = null;
    },
    setSelectedProduct: (state, action: PayloadAction<ProductDto | null>) => {
      state.selectedProduct = action.payload;
    },
    addProduct: (state, action: PayloadAction<ProductDto>) => {
      state.items.unshift(action.payload);
    },
    updateProduct: (state, action: PayloadAction<ProductDto>) => {
      const index = state.items.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setProducts,
  setSelectedProduct,
  addProduct,
  updateProduct,
  removeProduct,
  clearError,
} = productsSlice.actions;
export default productsSlice.reducer;
