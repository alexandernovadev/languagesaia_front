import { HttpClient } from "./api/HttpClient";
import type { EntityType, UploadImageResponse } from "@/types/api";

/**
 * Upload Image Service
 * Handles image uploads for words, expressions, and stories
 */
class UploadImageService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Upload image for any entity type
   */
  async uploadImage(
    imageFile: File,
    entityType: EntityType,
    entityId: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("imageFile", imageFile);

    const endpoint = `/api/upload-image/${entityType}/${entityId}`;

    return this.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Upload image for a word
   */
  async uploadWordImage(imageFile: File, wordId: string): Promise<any> {
    return this.uploadImage(imageFile, "word", wordId);
  }

  /**
   * Upload image for an expression
   */
  async uploadExpressionImage(
    imageFile: File,
    expressionId: string
  ): Promise<any> {
    return this.uploadImage(imageFile, "expression", expressionId);
  }
}

/**
 * Singleton instance
 */
const uploadImageServiceInstance = new UploadImageService();

// Export singleton and also convenience functions for backward compatibility
export const uploadImage = (
  imageFile: File,
  entityType: EntityType,
  entityId: string
) => uploadImageServiceInstance.uploadImage(imageFile, entityType, entityId);

export const uploadWordImage = (imageFile: File, wordId: string) =>
  uploadImageServiceInstance.uploadWordImage(imageFile, wordId);

export const uploadExpressionImage = (imageFile: File, expressionId: string) =>
  uploadImageServiceInstance.uploadExpressionImage(imageFile, expressionId);

// Re-export types
export type { EntityType, UploadImageResponse };

