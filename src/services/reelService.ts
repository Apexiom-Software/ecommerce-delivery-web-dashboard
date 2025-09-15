import { SERVER_IP } from "../../constants/constants";
import axios from "axios";
import { store } from "../app/redux/store";
import { selectAccessToken } from "../app/redux/slices/authSlice";

export interface Reel {
  id: number;
  videoUrl: string;
  publicId?: string;
  title?: string; // Optional title for the reel
  createdAt: string; // ISO timestamp from backend
  thumbnailUrl?: string;

}

export interface AddReelPayload {
  videoUrl: string;
  publicId?: string;
  title ?: string; // Optional title for the reel
}

export const ReelService = {
  /**
   * Fetch all saved reels from the backend.
   */
  async getAllVideos(): Promise<Reel[]> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.get<Reel[]>(
        `${SERVER_IP}/api/v1/reels`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reels:", error);
      throw error;
    }
  },

  /**
   * Send a new reel (video URL + optional publicId) to the backend.
   */
  async addVideo(payload: AddReelPayload): Promise<Reel> {
    try {
      const accessToken = selectAccessToken(store.getState());
      const response = await axios.post<Reel>(
        `${SERVER_IP}/api/v1/reels/add-video`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding reel:", error);
      throw error;
    }
  },

    async deleteVideo(reelId: number): Promise<void> {
        try {
        const accessToken = selectAccessToken(store.getState());
        await axios.delete(`${SERVER_IP}/api/v1/reels/${reelId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        } catch (error) {
        console.error("Error deleting reel:", error);
        throw error;
        }
    },
};
