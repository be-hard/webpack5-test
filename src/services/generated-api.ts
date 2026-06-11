import { getBackendService } from "./generated/api";

// Single entry for Orval-generated endpoints.
// Keep page code importing this wrapper instead of generated files directly.
export const apiClient = getBackendService();
