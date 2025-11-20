// src/types/knowledge.ts

export type KnowledgeFileStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED" | "DELETING";

export type KnowledgeFileType =
  | "pdf"
  | "docx"
  | "csv"
  | "html"
  | "gmail"
  | "google_drive"
  | "notion"
  | "website"
  | "text"; // Included for API, but will be filtered from display

export interface KnowledgeResource {
  id: string;
  persona_id: string;
  name: string;
  type: KnowledgeFileType;
  status: KnowledgeFileStatus;
  message: string | null;
  last_updated_at: string; // ISO string
  chunk_count: number;
  error_details: string | null;
}