import axios from "axios";
import { SERVER_IP } from "../../constants/constants";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";


export interface requiredOptionRequest {
  name: string;
}

export interface requiredOptionResponse {
  id: number;
  name: string;
  isDisabled:boolean
}

export interface PaginatedRequiredOptionResponse {
  content: requiredOptionResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last?: boolean;
}

export const getRequiredOptionById = async (
  id: number
): Promise<requiredOptionResponse> => {
  try {
    const accessToken = selectAccessToken(store.getState());

    if (!accessToken) {
      throw new Error("No access token found in Redux store. Please log in.");
    }

    const response = await axios.get<requiredOptionResponse>(
      `${SERVER_IP}/api/v1/required-options/${id}`,
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
        name: response.data.name,
        isDisabled: response.data.isDisabled,
      };
    }

    throw new Error("Failed to fetch required option");
   } catch (error: unknown) { 
    if (axios.isAxiosError(error)) {
      console.error(
        "Fetch Required Option Error:",
        error.response?.data || error.message
      );
      throw error.response?.data || { message: "Something went wrong" };
    }
    console.error("Unexpected error:", error);
    throw { message: "Something went wrong" };
  }
};

export const getAllRequiredOptions = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedRequiredOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    throw new Error("No access token found. Please log in.");
  }

  try {
    const params: Record<string, string | number> = { page, size };

    const response = await axios.get<PaginatedRequiredOptionResponse>(
      `${SERVER_IP}/api/v1/required-options/all`,
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
        "Error fetching orders:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
    throw new Error("Unexpected error fetching orders");
  }
};

export const createRequiredOption = async (
  request: requiredOptionRequest
): Promise<requiredOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.post(
      `${SERVER_IP}/api/v1/required-options/create`,
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
        "Axios error creating required option:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error creating required option:", error);
    }
    throw error;
  }
};

export const updateRequiredOption = async (
  id: number,
  request: requiredOptionRequest
): Promise<requiredOptionResponse> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    const response = await axios.put(
      `${SERVER_IP}/api/v1/required-options/update/${id}`,
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
        "Axios error updating required option:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error updating required option:", error);
    }
    throw error;
  }
};

export const deleteRequiredOption = async (id: number): Promise<void> => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) {
    console.error("No access token found. Please log in.");
    throw new Error("Authentication required");
  }

  try {
    await axios.delete(`${SERVER_IP}/api/v1/required-options/delete/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error deleting required option:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error deleting required option:", error);
    }
    throw error;
  }
};
