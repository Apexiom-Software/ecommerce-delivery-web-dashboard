import { SERVER_IP } from "../../constants/constants";
import axios from "axios";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";

export interface PromotionRequest {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  rules: Rule[];
  actions: Action[];
  promotionPhotoFile: string;
}

export interface PromotionResponse {
  id: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  rules: Rule[];
  actions: Action[];
  promotionPhoto: string;
  photoBase64: string;
}

export interface ProductRuleValue {
  productId: number;
  productName?: string;
}

export interface CategoryRuleValue {
  categoryId: number;
  categoryName?: string;
}


export interface FreeItemActionValue {
  productId: number;
  productName?: string;
  quantity?: number;
}

export interface Rule {
  id?: number;
  ruleType: "PRODUCT" | "CATEGORY" | "CART_VALUE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ruleValue: any
}

export interface Action {
  id?: number;
  actionType: "PERCENT_OFF" | "FIXED_OFF" | "FREE_ITEM";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionValue:any
}

export const PromotionService = {
  async getPromotionByProductId(
    productId: number
  ): Promise<PromotionResponse[]> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await axios.get(
        `${SERVER_IP}/api/v1/promotions/getPromotionByProductId/${productId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  },

  async createPromotion(payload: FormData): Promise<PromotionResponse> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.post<PromotionResponse>(
        `${SERVER_IP}/api/v1/promotions/create-promotion`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async updatePromotion(
    id: number,
    payload: FormData
  ): Promise<PromotionResponse> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.put<PromotionResponse>(
        `${SERVER_IP}/api/v1/promotions/update-promotion/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async deletePromotion(id: number): Promise<void> {
    try {
      const accessToken = selectAccessToken(store.getState());
      await axios.delete(`${SERVER_IP}/api/v1/promotions/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async getAllPromotions(
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: PromotionResponse[];
    totalPages: number;
    last: boolean;
  }> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.get<{
        content: PromotionResponse[];
        totalPages: number;
        last: boolean;
      }>(`${SERVER_IP}/api/v1/promotions/all?page=${page}&size=${size}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async getRuleTypes(): Promise<string[]> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.get<string[]>(
        `${SERVER_IP}/api/v1/promotions/distinct-rule-types`,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async getPromotionById(id: number): Promise<PromotionResponse> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.get<PromotionResponse>(
        `${SERVER_IP}/api/v1/promotions/promotion/${id}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
      throw error;
    }
  },

  async getPromotionByCategory(
    categoryName: string
  ): Promise<PromotionResponse[]> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.get(
        `${SERVER_IP}/api/v1/promotions/getPromotionsByCategory/${encodeURIComponent(
          categoryName
        )}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category promotions:", error);
      return [];
    }
  },

  async getActivePromotionByCartValue(): Promise<PromotionResponse | null> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await axios.get(
        `${SERVER_IP}/api/v1/promotions/getPromotionByCartValue/cart-value`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active promotion by cart value:", error);
      return null;
    }
  },
};
