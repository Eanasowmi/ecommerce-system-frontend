// Auth Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  roles: string[];
}

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Product Types
export interface ProductImage {
  id: string;
  url: string;
  primary?: boolean;
  isPrimary: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  active: boolean;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  vendorId: string;
  vendorName: string;
  images: ProductImage[];
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  categoryId: string;
  brandId: string;
}

// Category & Brand Types
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface BrandCreateRequest {
  name: string;
  description?: string;
  logoUrl?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  userId?: string;
  productId: string;
  // Flat fields returned by backend CartItemDto
  productName?: string;
  productSlug?: string;
  productImageUrl?: string;
  price?: number;
  // Nested product object (may or may not be present)
  product?: ProductDto;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItemRequest {
  productId: string;
  quantity: number;
}

// Order Types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: ProductDto;
  productName?: string;
  productSlug?: string;
  productImageUrl?: string;
  sellerPhone?: string;
  quantity: number;
  price: number;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  estimatedDeliveryDays?: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  paymentMethod: string;
  shippingAddress: string;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Wishlist Types
export interface WishlistItemDto {
  id: string;
  productId: string;
  product?: ProductDto;
  createdAt: string;
}

// Admin Types
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOverviewDto {
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalAdmins: number;
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalBrands: number;
  totalRevenue: number;
  orderStatusCounts: Record<string, number>;
}
