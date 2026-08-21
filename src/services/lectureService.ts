import { axiosClient as api } from "./api/HttpClient";
import type { ILecture as Lecture } from "@/types/models/Lecture";

export const lectureService = {
  async getLectures(page = 1, limit = 10, search = "", filters: Record<string, any> = {}, signal?: AbortSignal) {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search.trim()) params.append("search", search.trim());
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "language") return; // Backend uses req.user.language
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(","));
        } else if (!Array.isArray(value)) {
          params.append(key, String(value));
        }
      }
    });
    const res = await api.get(`/api/lectures?${params.toString()}`, { signal });
    return res.data;
  },

  async getLectureById(id: string) {
    const res = await api.get(`/api/lectures/${id}`);
    return res.data.data;
  },

  async postLecture(lectureData: Lecture) {
    const res = await api.post(`/api/lectures`, lectureData);
    return res.data.data;
  },

  async updateLecture(id: string, lectureData: Partial<Lecture>) {
    const res = await api.put(`/api/lectures/${id}`, lectureData);
    return res.data.data;
  },

  async deleteLecture(id: string | number) {
    const res = await api.delete(`/api/lectures/${id}`);
    return res.data;
  },

  async updateLectureAudioUrl(id: string, urlAudio: string, voice = "nova") {
    const res = await api.put(`/api/lectures/${id}/audio`, { urlAudio, voice });
    return res.data;
  },

  async generateLectureAudio(id: string, voice = "nova") {
    const res = await api.post(`/api/lectures/${id}/generate-audio`, { voice });
    return res.data.data as { urlAudio: string; recordId: string };
  },

  async importLectures(file: File, duplicateStrategy: string, batchSize: number, validateOnly: boolean) {
    const formData = new FormData();
    formData.append("file", file);
    // Los siguientes params van en query, no en formData
    const params = new URLSearchParams();
    params.append("duplicateStrategy", duplicateStrategy);
    params.append("batchSize", batchSize.toString());
    params.append("validateOnly", validateOnly.toString());
    const res = await api.post(`/api/lectures/import-file?${params.toString()}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async exportLectures() {
    const res = await api.get(`/api/lectures/export-file`);
    return res.data;
  },

  async putLecture(id: string, lectureData: Lecture) {
    const res = await api.put(`/api/lectures/${id}`, lectureData);
    return res.data.data;
  },

  async putLectureImage(idlecture: string, lectureString: string, imgOld: string) {
    const trimmedLectureString = lectureString.slice(0, 3500);
    const res = await api.post(`/api/lectures/generate-image/${idlecture}`, {
      lectureString: trimmedLectureString,
      imgOld,
    });
    return res.data;
  },

  // --- AI Generation ---
  // Note: Streaming is handled directly with fetch in useLectureGenerator hook
  // These methods are kept for backward compatibility but may not be used
  async generateLectureText(body: Record<string, any>) {
    // body: { prompt, level, typeWrite, addEasyWords, language, ... }
    const res = await api.post(`/api/lectures/generate-text`, body, {
      responseType: "stream", // Si usas streaming en el frontend
    });
    return res;
  },

  async generateLectureTopic(body: Record<string, any>) {
    // body: { existingText, type }
    const res = await api.post(`/api/lectures/generate-topic-stream`, body, {
      responseType: "stream", // Si usas streaming en el frontend
    });
    return res;
  },

  // Stream the continuation of an existing lecture (native fetch)
  async continueLecture(id: string, body: Record<string, any>, signal?: AbortSignal) {
    const token = localStorage.getItem("user-storage")
      ? JSON.parse(localStorage.getItem("user-storage") || "{}")?.state?.token
      : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${import.meta.env.VITE_BACK_URL}/api/lectures/${id}/continue`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  },
};
