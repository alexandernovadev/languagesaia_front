/**
 * Upload Response Types
 */

export type EntityType = "word" | "lecture" | "expression" | "story";

export interface UploadImageResponse {
  _id?: string;
  url: string;
  filename: string;
  entityId?: string;
}
