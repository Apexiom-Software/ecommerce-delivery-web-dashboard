import { SERVER_IP } from "../../constants/constants";
import axios from "axios";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  image?: string;
  //imageBase64?: string;
}

export const CategoryService = {
  async getCategories(): Promise<Category[]> {
    const accessToken = selectAccessToken(store.getState());
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get<Category[]>(
      `${SERVER_IP}/api/v1/categories/all`,
      { headers }
    );
    return response.data;
  },
  async createCategory(payload: FormData): Promise<Category> {
    const accessToken = selectAccessToken(store.getState());
    const response = await axios.post<Category>(
      `${SERVER_IP}/api/v1/categories/create`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async updateCategory(id: number, payload: FormData): Promise<Category> {
    const accessToken = selectAccessToken(store.getState());

    const response = await axios.put<Category>(
      `${SERVER_IP}/api/v1/categories/update/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
  async deleteCategory(id: number): Promise<void> {
    const accessToken = selectAccessToken(store.getState());
    await axios.delete(`${SERVER_IP}/api/v1/categories/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async getCategoryById(id: number): Promise<Category> {
    const accessToken = selectAccessToken(store.getState());
    const response = await axios.get<Category>(
      `${SERVER_IP}/api/v1/categories/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },
};
