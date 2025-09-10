// src/configurations/api.ts

export const API_BASE_URL: string = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8000";

console.log("API_BASE_URL resolved to:", API_BASE_URL);
export const ACCESS_TOKEN_EXPIRE_MINUTES: number = 52560000;

// Agent APIs
export const AGENT_ENDPOINT: string = `${API_BASE_URL}/agent`;
export const AGENT_ASK_ENDPOINT: string = `${AGENT_ENDPOINT}/ask`;