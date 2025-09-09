import axios from "axios";
import { SERVER_IP } from "../../constants/constants";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";


export interface AdditionalOptCategory {
  id: number;
  name: string;
}

export interface CreateOrUpdateAdditionalOptCategory {
  name: string;
}

export const AdditionalOptCategoryService = {
  async getAll(): Promise<AdditionalOptCategory[]> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.get<AdditionalOptCategory[]>(
        `${SERVER_IP}/api/v1/additional-options-categories/all`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message || "Unknown error";
        throw new Error(backendMessage);
      } else {
        throw new Error("Unexpected error while loading all categories");
      }
    }
  },

  async createCategory(
    payload: CreateOrUpdateAdditionalOptCategory
  ): Promise<AdditionalOptCategory> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.post<AdditionalOptCategory>(
        `${SERVER_IP}/api/v1/additional-options-categories/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message || "Unknown error";
        throw new Error(backendMessage);
      } else {
        throw new Error("Unexpected error while creating category");
      }
    }
  },

  async updateCategory(
    id: number,
    payload: CreateOrUpdateAdditionalOptCategory
  ): Promise<AdditionalOptCategory> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.put<AdditionalOptCategory>(
        `${SERVER_IP}/api/v1/additional-options-categories/upadate/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message || "Unknown error";
        throw new Error(backendMessage);
      } else {
        throw new Error("Unexpected error while updating category");
      }
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      const accessToken = selectAccessToken(store.getState());
      await axios.delete(
        `${SERVER_IP}/api/v1/additional-options-categories/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage = error.response.data?.message || "Unknown error";
        throw new Error(backendMessage);
      } else {
        throw new Error("Unexpected error while deleting category");
      }
    }
  },
};
