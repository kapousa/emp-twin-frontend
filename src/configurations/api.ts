// src/configurations/api.ts

export const API_BASE_URL: string = import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:8000";
export const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:8000";


console.log("API_BASE_URL resolved to:", API_BASE_URL);
export const ACCESS_TOKEN_EXPIRE_MINUTES: number = 52560000;


 // Helper to construct the full URL
export const getFullApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`; // <-- Must be exported

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
export const getUpdatePersonaSettingsEndpoint = (personaId: string) => `${PERSONA_ENDPOINT}/${personaId}/settings`;

// Public Persona API's
export const PUBLIC_PERSONA_ENDPOINT: string = `${API_BASE_URL}/public`;
export const getPublicPersonaEndpoint = (personaId: string): string =>
  `${PUBLIC_PERSONA_ENDPOINT}/persona/${personaId}`;
export const getPublicChatEndpoint = (personaId: string): string =>
  `${PUBLIC_PERSONA_ENDPOINT}/persona/${personaId}/chat`;

// BOARDROOM ENDPOINTS
export const ROOM_ENDPOINT: string = `${API_BASE_URL}/room`;
export const ROOM_CREATE_ENDPOINT: string = `${ROOM_ENDPOINT}/create`;
export const ROOM_LIST_ENDPOINT: string = `${ROOM_ENDPOINT}/list`;
export const getRoomDetailsEndpoint = (roomId: string): string => `${ROOM_ENDPOINT}/${roomId}`;
export const getRoomStartMeetingEndpoint = (roomId: string): string => `${ROOM_ENDPOINT}/${roomId}/start_meeting`;
export const getRoomChatEndpoint = (roomId: string, session_id: string): string => `${ROOM_ENDPOINT}/${roomId}/${session_id}/chat`;
export const getRoomDeleteEndpoint = (roomId: string): string => `${ROOM_ENDPOINT}/${roomId}/delete`;
export const generateRoomReportEndpoint = (roomId: string, sessionId: string): string =>
    `${ROOM_ENDPOINT}/${roomId}/${sessionId}/boardreport`;

// Persona knowlege files APIs
export const getKnowledgeResourcesEndpoint = (personaId: string): string =>  `${PERSONA_ENDPOINT}/${personaId}/knowledge`;
export const getUploadKnowledgeEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/knowledge/upload`;
export const getReprocessKnowledgeEndpoint = (personaId: string, resourceId: string): string => `${PERSONA_ENDPOINT}/${personaId}/knowledge/${resourceId}/reprocess`;
export const getCrawlWebsiteEndpoint = (personaId: string): string => `${PERSONA_ENDPOINT}/${personaId}/knowledge/crawl-website`;
export const getDeleteKnowledgeEndpoint = (personaId: string, resourceId: string): string => `${PERSONA_ENDPOINT}/${personaId}/knowledge/${resourceId}`;

// Chat Session APIs
export const CHAT_SESSION_ENDPOINT: string = `${API_BASE_URL}/chatsession`;
export const CHAT_SESSION_START_ENDPOINT: string = `${CHAT_SESSION_ENDPOINT}/start`;
export const endChatSession = (sessionId: string): string => `${CHAT_SESSION_ENDPOINT}/${sessionId}/end`;
// FIX: Changed from '/messages' to '/history'
export const getChatMessagesHistory = (sessionId: string): string => `${CHAT_SESSION_ENDPOINT}/${sessionId}/history`; 

// This endpoint is correct for fetching user sessions filtered by persona
export const getSessionsByUserAndPersona = (personaId: string): string => `${CHAT_SESSION_ENDPOINT}/persona/${personaId}/getall`;

// Chat Messages APIs (Kept for completeness, though they seem separate from chat session history)
export const CHAT_MESSAGES_ENDPOINT: string = `${API_BASE_URL}/chatmessages`;
export const sendNewMessageEndpoint: string = `${CHAT_MESSAGES_ENDPOINT}/send`; 
export const getMessageHistoryEndpoint = (sessionId: string): string => `${CHAT_MESSAGES_ENDPOINT}/${sessionId}/history`;

// --- Google Drive Integration Endpoints ---
/**
 * Endpoint to initiate the Gmail OAuth flow.
 */
export const getGmailInitiateEndpoint = (personaId: string): string =>
  `${PERSONA_ENDPOINT}/${personaId}/knowledge/integrate/gmail/initiate`;
/**
 * Endpoint to initiate the Google Drive OAuth flow and get the authorization URL.
 * @param personaId The ID of the persona to associate the integration with.
 */
export const getInitiateGoogleDriveEndpoint = (personaId: string): string =>
  `${PERSONA_ENDPOINT}/${personaId}/knowledge/integrate/google-drive/initiate`;
/**
 * Endpoint to initiate the Google Drive OAuth flow.
 * @param personaId The ID of the persona.
 */
export const getGoogleDriveInitiateEndpoint = (personaId: string): string =>
  `${PERSONA_ENDPOINT}/${personaId}/knowledge/integrate/google-drive/initiate`;
/**
 * The callback endpoint that Google will redirect to after user authorization.
 * The frontend must set its own public URL for this route as the redirect_uri in the Google Console.
 * @param personaId The ID of the persona.
 */
export const getGoogleDriveCallbackEndpoint = (personaId: string): string =>
  `${PERSONA_ENDPOINT}/${personaId}/knowledge/google-drive/callback`;

// --- WebSocket Endpoint ---
const getWebSocketBaseUrl = (baseUrl: string): string => {
    if (baseUrl.startsWith('https://')) {
        return `wss://${baseUrl.substring(8)}`;
    }
    if (baseUrl.startsWith('http://')) {
        return `ws://${baseUrl.substring(7)}`;
    }
    return baseUrl; // Fallback
};
export const WS_BASE_URL: string = getWebSocketBaseUrl(API_BASE_URL);
export const getChatWebSocketEndpoint = (sessionId: string): string => {
    // The path is now: /persona/ws/chat/{session_id}
    const wsPath = PERSONA_ENDPOINT.replace(API_BASE_URL, '') + `/ws/chat/${sessionId}`;
    return `${WS_BASE_URL}${wsPath}`;
};


/**
 * Endpoint for uploading a file to be used temporarily in a single chat session's RAG context.
 * @param personaId The ID of the persona.
 */
export const uploadTemporaryRAGFileEndpoint = (personaId: string): string => 
  `${PERSONA_ENDPOINT}/${personaId}/knowledge/upload-temp`;


// OR, simpler, if you know the prefix:
/*
export const getChatWebSocketEndpoint = (sessionId: string): string => 
    `${WS_BASE_URL}/persona/ws/chat/${sessionId}`;
*/