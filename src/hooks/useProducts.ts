import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import * as productsSlice from "@/store/slices/productsSlice";
import { productApi } from "@/lib/api-client";
import type { ProductDto, ProductCreateRequest } from "@/types";

export const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items,
    selectedProduct,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalElements,
  } = useSelector((state: RootState) => state.products);

  const fetchProducts = useCallback(
    async (page = 0, size = 12) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.getAllProducts(page, size);
        dispatch(productsSlice.setProducts(response.data as any));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to fetch products";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const searchProducts = useCallback(
    async (search: string, page = 0, size = 12) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.searchProducts(search, page, size);
        dispatch(productsSlice.setProducts(response.data as any));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Search failed";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const filterProducts = useCallback(
    async (
      categoryId?: string,
      brandId?: string,
      minPrice?: number,
      maxPrice?: number,
      page = 0,
      size = 12
    ) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.filterProducts(
          categoryId,
          brandId,
          minPrice,
          maxPrice,
          page,
          size
        );
        dispatch(productsSlice.setProducts(response.data as any));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Filter failed";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const fetchProductById = useCallback(
    async (id: string) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.getProductById(id);
        dispatch(productsSlice.setSelectedProduct(response.data as ProductDto));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to fetch product";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const fetchProductBySlug = useCallback(
    async (slug: string) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.getProductBySlug(slug);
        dispatch(productsSlice.setSelectedProduct(response.data as ProductDto));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to fetch product";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const createProduct = useCallback(
    async (data: ProductCreateRequest) => {
      dispatch(productsSlice.setLoading(true));
      try {
        const response = await productApi.createProduct(data);
        dispatch(productsSlice.addProduct(response.data as ProductDto));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to create product";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      dispatch(productsSlice.setLoading(true));
      try {
        await productApi.deleteProduct(id);
        dispatch(productsSlice.removeProduct(id));
        return { success: true };
      } catch (err: unknown) {
        const message = (err as any)?.response?.data?.message || "Failed to delete product";
        dispatch(productsSlice.setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  return {
    items,
    selectedProduct,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchProducts,
    searchProducts,
    filterProducts,
    fetchProductById,
    fetchProductBySlug,
    createProduct,
    deleteProduct,
  };
};
