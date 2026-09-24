const API_BASE_URL = "/api";

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiFetch(
  endpoint: string,
  options: ApiOptions = {}
) {
  const token =
    options.token ||
    (typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null);

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Something went wrong"
    );
  }

  return data;
}