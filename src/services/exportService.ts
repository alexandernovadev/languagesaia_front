import { axiosClient as api } from "./api/HttpClient";
import { wordService } from "./wordService";
import { expressionService } from "./expressionService";
import { userService } from "./userService";

/**
 * Helper function to download a blob as a file
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportService = {
  /**
   * Export words to JSON file
   */
  async exportWords() {
    try {
      const response = await api.get("/api/words/export-file", {
        responseType: "blob",
      });

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "words-export.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      downloadFile(response.data, filename);
      return { success: true, filename };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al exportar palabras"
      );
    }
  },

  /**
   * Export expressions to JSON file
   */
  async exportExpressions() {
    try {
      const response = await api.get("/api/expressions/export-file", {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = "expressions-export.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      downloadFile(response.data, filename);
      return { success: true, filename };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al exportar expresiones"
      );
    }
  },

  /**
   * Export exams to JSON file
   */
  async exportExams() {
    try {
      const response = await api.get("/api/exams/export-file", {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = "exams-export.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      downloadFile(response.data, filename);
      return { success: true, filename };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al exportar exámenes"
      );
    }
  },

  /**
   * Export users to JSON file
   */
  async exportUsers() {
    try {
      const response = await api.get("/api/users/export-file", {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = "users-export.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      downloadFile(response.data, filename);
      return { success: true, filename };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al exportar usuarios"
      );
    }
  },

  /** Export stories, chapters and reading progress to one JSON backup. */
  async exportStories() {
    try {
      const response = await api.get("/api/stories/export-file", {
        responseType: "blob",
      });
      const contentDisposition = response.headers["content-disposition"];
      let filename = "stories-export.json";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) filename = filenameMatch[1];
      }
      downloadFile(response.data, filename);
      return { success: true, filename };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al exportar stories");
    }
  },
};
