import axios from "axios";
import { SERVER_IP } from "../../constants/constants";
import { store } from "../app/redux/store";

// Types
export interface ProductCategory {
  categoryId: number;
  name: string;
  description: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  calories?: number;
  categoryId: number;
  additionalOptionIds?: number[];
  requiredOptionIds?: number[];
  selectedSize: string;
  includeSizes?: boolean;
  price?: number;
  smallSizePrice?: number;
  mediumSizePrice?: number;
  largeSizePrice?: number;
}


export interface ProductPayloadEdit {
name: string;
  description?: string;
  calories?: number;
  categoryId: number;
  additionalOptionIds?: number[];
  requiredOptionIds?: number[];
  includeSizes?: boolean;
  price?: number;
  smallSizePrice?: number;
  mediumSizePrice?: number;
  largeSizePrice?: number;
  isDisabled?: boolean;
  image?:boolean
}


export interface PaginatedProductResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface ProductAdditionalOption {
  id: number;
  name: string;
  unitPrice: number;
  additional_option_category_id: number;
  categoryName: string;
}

export interface ProductRequiredOption {
  id: number;
  name: string;
}

export type ProductStatus = "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON";

export interface Product {
  productId: number;
  categoryId: number;
  name: string;
  price: number;
  calories?: number;
  productPhoto?: string;
  photoBase64?: string;
  description?: string;
  status: ProductStatus;
  category: ProductCategory;
  additionalOptions?: ProductAdditionalOption[];
  requiredOptions?: ProductRequiredOption[];
  isPromoted?: boolean;
  includeSizes?: boolean;
  smallSizePrice?: number;
  mediumSizePrice?: number;
  largeSizePrice?: number;
  selectedSize?: string;
  stockQuantity: number;
  isPopular?: boolean;
  isDisabled: boolean;
}

// Error types
type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

export const ProductService = {
  /**
   * Fetches top 10 products with authentication
   * @throws {ApiError} When request fails
   */
  async getTop10Products(): Promise<Product[]> {
    try {
      const state = store.getState();
      const accessToken = state.auth.accessToken;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get<Product[]>(
        `${SERVER_IP}/api/v1/products/public/getTop10ByOrderByProductId`,
        { headers }
      );

      return response.data;
    } catch (error: unknown) {
      const apiError: ApiError = {
        message: "Failed to fetch products",
      };

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const err = error as {
          response?: { status?: number; data?: { message?: string } };
          code?: string;
          request?: unknown;
        };
        apiError.status = err.response?.status;
        apiError.code = err.code;
        switch (err.response?.status) {
          case 401:
            apiError.message = "Session expired - please login again";
            break;
          case 403:
            apiError.message = "Access denied - check your permissions";
            break;
          case 404:
            apiError.message = "Products endpoint not found";
            break;
          case 500:
            apiError.message = "Server error - please try again later";
            break;
          default:
            apiError.message = err.response?.data?.message || apiError.message;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        apiError.message = "Network error - check your connection";
      }

      console.error(
        "ProductService.getTop10Products failed:",
        apiError.message,
        error
      );
      throw apiError;
    }
  },

  /**
   * Gets single product by ID
   * @param productId - The ID of the product to fetch
   */
  async getProductById(productId: number): Promise<Product> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get<Product>(
        `${SERVER_IP}/api/v1/products/public/getProductById/${productId}`,
        { headers }
      );

      return response.data;
    } catch (error: unknown) {
      console.error(`Failed to fetch product ${productId}:`, error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        throw {
          message:
            err.response?.data?.message ||
            `Failed to fetch product ${productId}`,
          status: err.response?.status,
        };
      } else {
        throw {
          message: `Failed to fetch product ${productId}`,
          status: undefined,
        };
      }
    }
  },

  /**
   * Gets products by category
   * @param categoryId - The category ID to filter by
   */
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get<Product[]>(
        `${SERVER_IP}/api/v1/products/public/category/${categoryId}`,
        { headers }
      );

      return response.data;
    } catch (error: unknown) {
      console.error(
        `Failed to fetch products for category ${categoryId}:`,
        error
      );
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        throw {
          message:
            err.response?.data?.message ||
            `Failed to fetch products for category ${categoryId}`,
          status: err.response?.status,
        };
      } else {
        throw {
          message: `Failed to fetch products for category ${categoryId}`,
          status: undefined,
        };
      }
    }
  },

  async filterProductsByName(
    name?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedProductResponse> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const params: Record<string, string | number> = { page, size };
      if (name && name.trim()) {
        params.name = name;
      }

      const response = await axios.get<PaginatedProductResponse>(
        `${SERVER_IP}/api/v1/products/public/filter-by-name`,
        { headers, params }
      );

      return response.data;
    } catch (error: unknown) {
      let apiError: ApiError = {
        message: "Failed to filter products",
      };

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { status?: number; data?: { message?: string } };
          code?: string;
          request?: unknown;
        };
        apiError = {
          message: err.response?.data?.message || "Failed to filter products",
          status: err.response?.status,
          code: err.code,
        };
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        apiError.message = "Network error - check your connection";
      }

      console.error(
        "ProductService.filterProductsByName failed:",
        apiError.message,
        error
      );
      throw apiError;
    }
  },

  async createProduct(payload: FormData): Promise<Product> {
    try {
      // Use the same approach as mobile version
      const accessToken = store.getState().auth.accessToken;

      if (!accessToken) {
        throw new Error("No access token available");
      }

      const response = await axios.post<Product>(
        `${SERVER_IP}/api/v1/products/create-product`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {

      // More detailed error handling
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw {
            message: "Access denied. Please check your permissions.",
            status: 403,
          };
        }

        throw {
          message: error.response?.data?.message || "Failed to create product",
          status: error.response?.status,
        };
      }

      throw {
        message: "Network error - please check your connection",
        status: undefined,
      };
    }
  },

  async updateProduct(productId: number, payload: FormData): Promise<Product> {
    try {
      const accessToken = store.getState().auth.accessToken;

      const response = await axios.put<Product>(
        `${SERVER_IP}/api/v1/products/update-product/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        throw {
          message: err.response?.data?.message || "Failed to update product",
          status: err.response?.status,
        };
      } else {
        throw {
          message: "Failed to update product",
          status: undefined,
        };
      }
    }
  },

  async getAllProducts(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedProductResponse> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get<PaginatedProductResponse>(
        `${SERVER_IP}/api/v1/products/all`,
        { headers, params: { page, size } }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Failed to fetch all products:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        throw {
          message: err.response?.data?.message || "Failed to fetch products",
          status: err.response?.status,
        };
      } else {
        throw {
          message: "Failed to fetch products",
          status: undefined,
        };
      }
    }
  },

  // deleteProduct
  async deleteProduct(productId: number): Promise<void> {
    try {
      const accessToken = store.getState().auth.accessToken;

      await axios.delete(
        `${SERVER_IP}/api/v1/products/delete-product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error: unknown) {
      console.error("Failed to delete product:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const err = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        throw {
          message: err.response?.data?.message || "Failed to delete product",
          status: err.response?.status,
        };
      } else {
        throw {
          message: "Failed to delete product",
          status: undefined,
        };
      }
    }
  },

  // Ajoutez cette méthode à votre ProductService
  async getProductsByCategoryName(
    categoryName: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedProductResponse> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const encodedCategoryName = encodeURIComponent(categoryName);

      const response = await axios.get<PaginatedProductResponse>(
        `${SERVER_IP}/api/v1/products/getProductsByCategoryName/${encodedCategoryName}`,
        {
          headers,
          params: {
            page,
            size,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      let apiError: ApiError = {
        message: "Failed to fetch products by category",
      };

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { status?: number; data?: { message?: string } };
          code?: string;
          request?: unknown;
        };
        apiError = {
          message: "Failed to fetch products by category",
          status: err.response?.status,
          code: err.code,
        };
        // Gestion des erreurs spécifiques par statut HTTP
        switch (err.response?.status) {
          case 400:
            apiError.message = "Invalid category name format";
            break;
          case 404:
            apiError.message = "Category not found";
            break;
          case 500:
            apiError.message = "Server error - please try again later";
            break;
          default:
            apiError.message = err.response?.data?.message || apiError.message;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        apiError.message = "Network error - check your connection";
      }

      console.error(
        "ProductService.getProductsByCategoryName failed:",
        apiError.message,
        error
      );
      throw apiError;
    }
  },

  // get product by category ID
  async getProductsByCategoryId(
    categoryId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedProductResponse> {
    try {
      const accessToken = store.getState().auth.accessToken;
      const headers = accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {};

      const response = await axios.get<PaginatedProductResponse>(
        `${SERVER_IP}/api/v1/products/public/getProductsByCategoryId/${categoryId}`,
        {
          headers,
          params: { page, size },
        }
      );

      return response.data;
    } catch (error: unknown) {
      let apiError: ApiError = {
        message: "Failed to fetch products by category ID",
      };

      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          response?: { status?: number; data?: { message?: string } };
          code?: string;
          request?: unknown;
        };
        apiError = {
          message: "Failed to fetch products by category ID",
          status: err.response?.status,
          code: err.code,
        };

        if (err.response) {
          switch (err.response.status) {
            case 400:
              apiError.message = "Invalid category ID format";
              break;
            case 404:
              apiError.message = "Category not found";
              break;
            case 500:
              apiError.message = "Server error - please try again later";
              break;
            default:
              apiError.message = err.response.data?.message || apiError.message;
          }
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        apiError.message = "Network error - check your connection";
      }

      console.error(
        "ProductService.getProductsByCategoryId failed:",
        apiError.message,
        error
      );
      throw apiError;
    }
  },
};

export const handleProductError = (error: ApiError) => {
  const defaultMessage = "An error occurred while fetching product data";

  return {
    showToast: true,
    message: error.message || defaultMessage,
    isCritical: error.status ? error.status >= 500 : false,
  };
};
