import * as SecureStore from "expo-secure-store";
import { DARA_API_URL } from "./config";

const AUTH_TOKEN_KEY = "dara_auth_token";
const AUTH_USER_ID_KEY = "dara_auth_user_id";
const AUTH_USER_KEY = "dara_auth_user";
const SETUP_DONE_PREFIX = "dara_setup_done";

export type DaraAuthUser = {
  id: string;
  email: string;
  name: string;
};

export type DaraAuthResponse = {
  token: string;
  user: DaraAuthUser;
};

export async function signupDaraUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<DaraAuthResponse> {
  const response = await fetch(`${DARA_API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Signup failed");
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, json.token);
  await SecureStore.setItemAsync(AUTH_USER_ID_KEY, json.user.id);
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(json.user));
  return json as DaraAuthResponse;
}

export async function loginDaraUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<DaraAuthResponse> {
  const response = await fetch(`${DARA_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Login failed");
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, json.token);
  await SecureStore.setItemAsync(AUTH_USER_ID_KEY, json.user.id);
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(json.user));
  return json as DaraAuthResponse;
}

export async function getDaraAuthToken() {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function getDaraAuthUserId() {
  return SecureStore.getItemAsync(AUTH_USER_ID_KEY);
}

export async function getDaraAuthUser(): Promise<DaraAuthUser | null> {
  const raw = await SecureStore.getItemAsync(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function markDaraSetupCompleted() {
  const userId = await getDaraAuthUserId();
  if (!userId) return;

  await SecureStore.setItemAsync(`${SETUP_DONE_PREFIX}_${userId}`, "true");
}

export async function hasDaraSetupCompleted() {
  const userId = await getDaraAuthUserId();
  if (!userId) return false;

  return (await SecureStore.getItemAsync(`${SETUP_DONE_PREFIX}_${userId}`)) === "true";
}

export async function logoutDaraUser() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_ID_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}
