import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@services";
import { clearAuthTokens } from "@services/auth/token";
import { GetUserOrdersStatus } from "@services/generated/model";
import type { OrderListResponse, UserProfileResponse } from "@services/generated/model";

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse["data"]>();
  const [orders, setOrders] = useState<OrderListResponse["data"]>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await apiClient.getProfile();
      setProfile(response.data);

      const orderResponse = await apiClient.getUserOrders("1", {
        status: GetUserOrdersStatus.paid,
        page: 1,
        pageSize: 10,
      });
      setOrders(orderResponse.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthTokens();
    navigate("/login");
  };

  return (
    <div>
      <h1>Home</h1>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <button type="button" onClick={loadProfile} disabled={loading}>
        {loading ? "Loading..." : "Load profile"}
      </button>
      {error && <p>{error}</p>}
      {profile && (
        <pre>
          <code>{JSON.stringify(profile, null, 2)}</code>
        </pre>
      )}
      {orders && (
        <pre>
          <code>{JSON.stringify(orders, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}
