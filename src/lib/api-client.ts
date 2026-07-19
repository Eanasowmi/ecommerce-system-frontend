// Cleaned API client implementation with OTP endpoints
import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    // Add auth token to requests (except auth routes)
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        const isAuth = config.url?.startsWith("/auth/") ?? false;
        if (token && !isAuth) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 globally — only redirect to login if the user *had* a token
    // (i.e., their session expired). Guests hitting auth-protected endpoints
    // should NOT be force-redirected; their requests just silently fail.
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
          const hadToken = !!localStorage.getItem("auth");
          if (hadToken) {
            localStorage.removeItem("auth");
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("auth");
      return auth ? JSON.parse(auth).accessToken : null;
    }
    return null;
  }

  setAuthToken(token: string) {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("auth");
      if (auth) {
        const data = JSON.parse(auth);
        data.accessToken = token;
        localStorage.setItem("auth", JSON.stringify(data));
      }
    }
  }

  clearAuth() {
    if (typeof window !== "undefined") localStorage.removeItem("auth");
  }

  get<T>(url: string, cfg = {}) { return this.axiosInstance.get<T>(url, cfg); }
  post<T>(url: string, d?: unknown, cfg = {}) { return this.axiosInstance.post<T>(url, d, cfg); }
  put<T>(url: string, d?: unknown, cfg = {}) { return this.axiosInstance.put<T>(url, d, cfg); }
  patch<T>(url: string, d?: unknown, cfg = {}) { return this.axiosInstance.patch<T>(url, d, cfg); }
  delete<T>(url: string, cfg = {}) { return this.axiosInstance.delete<T>(url, cfg); }
}

export const apiClient = new ApiClient();

// Auth API with OTP endpoints
export const authApi = {
  login: (email: string, password: string) => apiClient.post("/auth/login", { email, password }),
  register: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post("/auth/register", { email, password, firstName, lastName }),
  registerSeller: (email: string, password: string, firstName: string, lastName: string) =>
    apiClient.post("/auth/register-seller", { email, password, firstName, lastName }),
  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (data: { email: string; otpCode: string; newPassword: string }) =>
    apiClient.post("/auth/reset-password", data),
};

// Product API (unchanged core functions)
export const productApi = {
  getAllProducts: (page = 0, size = 12) => apiClient.get(`/products?page=${page}&size=${size}`),
  searchProducts: (search: string, page = 0, size = 12) =>
    apiClient.get(`/products?search=${search}&page=${page}&size=${size}`),
  getProductsByCategory: (cat: string, page = 0, size = 12) =>
    apiClient.get(`/products?category=${cat}&page=${page}&size=${size}`),
  getProductsByBrand: (brand: string, page = 0, size = 12) =>
    apiClient.get(`/products?brand=${brand}&page=${page}&size=${size}`),
  filterProducts: (cat?: string, brand?: string, min?: number, max?: number, page = 0, size = 12) => {
    let url = `/products/filter?page=${page}&size=${size}`;
    if (cat) url += `&categoryId=${cat}`;
    if (brand) url += `&brandId=${brand}`;
    if (min) url += `&minPrice=${min}`;
    if (max) url += `&maxPrice=${max}`;
    return apiClient.get(url);
  },
  getProductById: (id: string) => apiClient.get(`/products/${id}`),
  getProductBySlug: (slug: string) => apiClient.get(`/products/slug/${slug}`),
  getProductsByVendor: (vendorId: string) => apiClient.get(`/products/vendor/${vendorId}`),
  getMyProducts: () => apiClient.get("/products/my"),
  createProduct: (data: unknown) => apiClient.post("/products", data),
  updateProduct: (id: string, data: unknown) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/products/${id}`),
  approveProduct: (id: string) => apiClient.put(`/products/${id}/approve`),
  getPendingProducts: (page = 0, size = 12) => apiClient.get(`/products/pending?page=${page}&size=${size}`),
};

// Category API
export const categoryApi = {
  getAllCategories: () => apiClient.get("/categories"),
  getCategoryById: (id: string) => apiClient.get(`/categories/${id}`),
  getCategoryBySlug: (slug: string) => apiClient.get(`/categories/slug/${slug}`),
  createCategory: (data: unknown) => apiClient.post("/categories", data),
};

// Brand API
export const brandApi = {
  getAllBrands: () => apiClient.get("/brands"),
  getBrandById: (id: string) => apiClient.get(`/brands/${id}`),
  getBrandBySlug: (slug: string) => apiClient.get(`/brands/slug/${slug}`),
  createBrand: (data: unknown) => apiClient.post("/brands", data),
};

// Cart API
export const cartApi = {
  getCart: () => apiClient.get("/cart"),
  addToCart: (productId: string, qty: number) => apiClient.post("/cart", { productId, quantity: qty }),
  updateCartItem: (itemId: string, qty: number) => apiClient.put(`/cart/${itemId}?quantity=${qty}`),
  removeFromCart: (itemId: string) => apiClient.delete(`/cart/${itemId}`),
  clearCart: () => apiClient.delete("/cart"),
};

// Order API
export const orderApi = {
  checkout: (method: string, address: string) => apiClient.post("/orders/checkout", { paymentMethod: method, shippingAddress: address }),
  getMyOrders: () => apiClient.get("/orders/my"),
  getSellerOrders: () => apiClient.get("/orders/seller"),
  getOrderById: (id: string) => apiClient.get(`/orders/${id}`),
  getAllOrders: () => apiClient.get("/orders"),
  updateOrderStatus: (id: string, status: string, estimatedDeliveryDays?: number) => {
    let url = `/orders/${id}/status?status=${status}`;
    if (estimatedDeliveryDays !== undefined) {
      url += `&estimatedDeliveryDays=${estimatedDeliveryDays}`;
    }
    return apiClient.put(url);
  },
  cancelOrder: (id: string) => apiClient.post(`/orders/${id}/cancel`),
  deleteOrder: (id: string) => apiClient.delete(`/orders/${id}`),
};

// Profile API
export const profileApi = {
  getProfile: () => apiClient.get("/profile/me"),
  updateProfile: (data: { firstName: string; lastName: string; profilePictureUrl?: string; phoneNumber?: string }) =>
    apiClient.put("/profile/me", data),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => apiClient.get("/wishlist"),
  addToWishlist: (productId: string) => apiClient.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId: string) => apiClient.delete(`/wishlist/${productId}`),
};

// Admin API
export const adminApi = {
  getOverview: () => apiClient.get("/admin/overview"),
  getUsers: () => apiClient.get("/admin/users"),
  updateUserRoles: (id: string, roles: string[]) => apiClient.put(`/admin/users/${id}/roles`, { roles }),
  updateUserStatus: (id: string, enabled: boolean) => apiClient.put(`/admin/users/${id}/status`, { enabled }),
};
