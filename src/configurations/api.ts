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

// Persona APIs
export const PERSONA_ENDPOINT: string = `${API_BASE_URL}/persona`;
export const PERSONA_BUILD_ENDPOINT: string = `${PERSONA_ENDPOINT}/build`;
export const PERSONA_LIST_ENDPOINT: string = `${PERSONA_ENDPOINT}/list`;
export const getPersonaDetailsEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/details`;
export const getPersonaUpdateEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/update`;
export const getPersonaDeleteEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/delete`;
export const getPersonaChatEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/chat`;
export const getPersonaAnswerEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/ask`;

// Chat Session APIs
export const CHAT_SESSION_ENDPOINT: string = `${API_BASE_URL}/chatsession`;
export const CHAT_SESSION_START_ENDPOINT: string = `${CHAT_SESSION_ENDPOINT}/start`;
export const getAllUserSessions = (userId: string): string => `${CHAT_SESSION_ENDPOINT}/${userId}/getall`;
export const endChatSession = (sessionId: string): string => `${CHAT_SESSION_ENDPOINT}/${sessionId}/end`;


// Chat Messages APIs
export const CHAT_MESSAGES_ENDPOINT: string = `${API_BASE_URL}/chatmessages`;
export const CHAT_SESSION_START_ENDPOINT: string = `${CHAT_MESSAGES_ENDPOINT}/start`;
export const getAllUserSessions = (userId: string): string => `${CHAT_MESSAGES_ENDPOINT}/${userId}/getall`;
export const endChatSession = (sessionId: string): string => `${CHAT_MESSAGES_ENDPOINT}/${sessionId}/end`;
