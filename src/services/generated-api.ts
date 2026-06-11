import { getBackendService } from "./generated/api";
import { configureHttp } from "./http";

// Single entry for Orval-generated endpoints.
// Keep page code importing this wrapper instead of generated files directly.
export const apiClient = getBackendService();

configureHttp({
  refreshAccessToken: async (refreshToken) => {
    const response = await apiClient.refreshToken(
      { refreshToken },
      {
        skipAuthRefresh: true,
      },
    );

    if (!response.data) {
      throw new Error("Refresh token response is empty");
    }

    return response.data;
  },
});
