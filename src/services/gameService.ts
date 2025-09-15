import { SERVER_IP } from "../../constants/constants";
import axios from "axios";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";

export interface ProductWithProbability {
  productId: number;
  name: string;
  probability: number;
  photoUrl: string;
}

export type WonProductStatus = "ACTIVE" | "PICKED" | "EXPIRED";

export interface GameRequest {
  name: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  winningPercent: number;
  description?: string;
  active?: boolean;
  products: Array<{
    productId: number;
    probability: number;
  }>;
}

export interface GameResponse {
  id: number;
  name: string;
  frequency: string;
  winningPercent: number;
  description?: string;
  active: boolean;
  products: ProductWithProbability[];
}

export interface GameProductResponse {
  productId: number;
  name: string;
  productPhoto: string;
  probability: number;
}

export interface WinnerResponse {
  id: number;
  won: boolean;
  product?: {
    productId: number;
    name: string;
    productPhoto: string;
    probability: number;
  };
  userPhone: string;
  firstname: string;
  lastname: string;
  nextPlayAvailableAt?: string;
  sectorIndex: number;
  error?: string;
  wonProductStatus: WonProductStatus;
}

export interface PaginatedWinnerResponse {
  content: WinnerResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const getAuthHeaders = () => {
  const accessToken = selectAccessToken(store.getState());
  if (!accessToken) throw new Error("No access token found");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

export const GameService = {
  getActiveGame: () =>
    axios
      .get<GameResponse>(`${SERVER_IP}/api/v1/games`, {
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  createGame: (req: GameRequest) =>
    axios
      .post<GameResponse>(`${SERVER_IP}/api/v1/games/create`, req, {
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  updateGame: (req: GameRequest) =>
    axios
      .put<GameResponse>(`${SERVER_IP}/api/v1/games/update`, req, {
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  deleteGame: () =>
    axios.delete(`${SERVER_IP}/api/v1/games`, { headers: getAuthHeaders() }),

  activateGame: () =>
    axios
      .put<GameResponse>(
        `${SERVER_IP}/api/v1/games/activate`,
        {},
        { headers: getAuthHeaders() }
      )
      .then((res) => res.data),

  getWheelProducts: () =>
    axios
      .get<GameProductResponse[]>(`${SERVER_IP}/api/v1/games/products`, {
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  playWheel: (userId: number) =>
    axios
      .post<WinnerResponse>(`${SERVER_IP}/api/v1/games/play`, null, {
        params: { userId },
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  updateWinnerStatus: (
    winnerId: number,
    status: WonProductStatus
  ): Promise<WinnerResponse> => {
    return axios
      .put<WinnerResponse>(
        `${SERVER_IP}/api/v1/games/winners/${winnerId}/status`,
        `"${status}"`,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res.data);
  },

  getAllWinners: (page: number = 0, size: number = 10) =>
    axios
      .get<PaginatedWinnerResponse>(`${SERVER_IP}/api/v1/games/winners`, {
        params: { page, size },
        headers: getAuthHeaders(),
      })
      .then((res) => res.data),

  getMyWins: (userId: number, page: number = 0, size: number = 10) =>
    axios
      .get<PaginatedWinnerResponse>(
        `${SERVER_IP}/api/v1/games/winners/my-wins`,
        {
          params: { userId, page, size },
          headers: getAuthHeaders(),
        }
      )
      .then((res) => res.data),
};
