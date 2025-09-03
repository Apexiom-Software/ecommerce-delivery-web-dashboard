import axios from "axios";
import { SERVER_IP } from "../../constants/constants";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";



export interface AdditionalOptionRequest {
  name?: string;
  unitPrice?: number; // Changed from Number to number
  additional_option_category_id: number;
}

export interface AdditionalOptionResponse {
  id: number; // Changed from Number to number
  name?: string;
  unitPrice?: number; // Changed from Number to number
  categoryName: string;
  additional_option_category_id: number;
}

export interface PaginatedAdditionalOptionResponse {
  content: AdditionalOptionResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last?: boolean;
}

export const getAdditionalOptionById = async (
  id: number
): Promise<AdditionalOptionResponse> => {
  try {
    const accessToken = selectAccessToken(store.getState());

    if (!accessToken) {
      throw new Error("No access token found in Redux store. Please log in.");
    }

    const response = await axios.get<AdditionalOptionResponse>(
      `${SERVER_IP}/api/v1/additional-options/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200 && response.data) {
      return {
        id: response.data.id,
        name: response.data.name ?? "",
        unitPrice: response.data.unitPrice ?? 0,
        additional_option_category_id:
          response.data.additional_option_category_id,
        categoryName: response.data.categoryName,
      };
    }

    throw new Error("Failed to fetch additional option");
  } catch (error: unknown) { // More specific typing
    if (axios.isAxiosError(error)) {
      console.error(
        "Fetch Additional Option Error:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Something went wrong" };
    }
    console.error("Unexpected error:", error);
    throw { message: "Something went wrong" };
  }
};

export const getAllAdditionalOptions = async (
  page = 0, // Removed explicit type as it's inferred
  size = 10 // Removed explicit type as it's inferred
): Promise<PaginatedAdditionalOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    throw new Error("No access token found. Please log in.");
  }

  try {
    const params: Record<string, string | number> = { page, size }; // More specific type

    const response = await axios.get<PaginatedAdditionalOptionResponse>(
      `${SERVER_IP}/api/v1/additional-options/all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error fetching additional options:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch additional options"
      );
    }
    throw new Error("Unexpected error fetching additional options");
  }
};

export const createAdditionalOption = async (
  request: AdditionalOptionRequest
): Promise<AdditionalOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.post<AdditionalOptionResponse>(
      `${SERVER_IP}/api/v1/additional-options/create`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error creating additional option:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Failed to create additional option" };
    } else {
      console.error("Unexpected error creating additional option:", error);
      throw new Error("Unexpected error creating additional option");
    }
  }
};

export const updateAdditionalOption = async (
  id: number,
  request: AdditionalOptionRequest
): Promise<AdditionalOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.put<AdditionalOptionResponse>(
      `${SERVER_IP}/api/v1/additional-options/update/${id}`,
      request,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error updating additional option:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Failed to update additional option" };
    } else {
      console.error("Unexpected error updating additional option:", error);
      throw new Error("Unexpected error updating additional option");
    }
  }
};

export const deleteAdditionalOption = async (id: number): Promise<void> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    await axios.delete(`${SERVER_IP}/api/v1/additional-options/delete/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error deleting additional option:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Failed to delete additional option" };
    } else {
      console.error("Unexpected error deleting additional option:", error);
      throw new Error("Unexpected error deleting additional option");
    }
  }
};