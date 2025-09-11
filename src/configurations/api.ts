// src/configurations/api.ts

export const API_BASE_URL: string = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8000";

console.log("API_BASE_URL resolved to:", API_BASE_URL);
export const ACCESS_TOKEN_EXPIRE_MINUTES: number = 52560000;

// User APIs
export const USER_ENDPOINT: string = `${API_BASE_URL}/users`;
export const USER_LOGIN_ENDPOINT: string = `${USER_ENDPOINT}/login`;

// Security APIs
export const AUTH_ENDPOINT: string = `${API_BASE_URL}/auth`;
export const AUTH_VERIFY_ENDPOINT: string = `${AUTH_ENDPOINT}/verify`;

// Agent APIs
export const AGENT_ENDPOINT: string = `${API_BASE_URL}/agent`;
export const AGENT_ASK_ENDPOINT: string = `${AGENT_ENDPOINT}/ask`;