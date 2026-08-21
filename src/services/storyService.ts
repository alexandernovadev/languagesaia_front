import { axiosClient as api } from "./api/HttpClient";
import type { IStory, IStoryProgress, VocabReport } from "@/types/models/Story";

export const storyService = {
  async getStories(page = 1, limit = 12, search = "", filters: Record<string, any> = {}, signal?: AbortSignal) {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (search.trim()) params.append("search", search.trim());
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(","));
        } else if (!Array.isArray(value)) {
          params.append(key, String(value));
        }
      }
    });
    const res = await api.get(`/api/stories?${params.toString()}`, { signal });
    return res.data;
  },

  async getStoryById(id: string) {
    const res = await api.get(`/api/stories/${id}`);
    return res.data.data;
  },

  async createStory(storyData: Partial<IStory>) {
    const res = await api.post(`/api/stories`, storyData);
    return res.data.data;
  },

  async updateStory(id: string, storyData: Partial<IStory>) {
    const res = await api.put(`/api/stories/${id}`, storyData);
    return res.data.data;
  },

  async deleteStory(id: string) {
    const res = await api.delete(`/api/stories/${id}`);
    return res.data;
  },

  async generateChapter(storyId: string, instructions?: string, requestEnding?: boolean, signal?: AbortSignal) {
    const res = await api.post(
      `/api/stories/${storyId}/chapters`,
      { instructions, requestEnding },
      { signal, responseType: "stream" }
    );
    return res.data;
  },

  async saveChapter(storyId: string, chapterData: { title: string; content: string }) {
    const res = await api.post(`/api/stories/${storyId}/chapters/save`, chapterData);
    return res.data.data;
  },

  async updateChapter(storyId: string, chapterIndex: number, data: Partial<{ title: string; content: string }>) {
    const res = await api.put(`/api/stories/${storyId}/chapters/${chapterIndex}`, data);
    return res.data.data;
  },

  async deleteChapter(storyId: string, chapterIndex: number) {
    const res = await api.delete(`/api/stories/${storyId}/chapters/${chapterIndex}`);
    return res.data.data;
  },

  async getVocabReport(storyId: string): Promise<VocabReport[]> {
    const res = await api.get(`/api/stories/${storyId}/vocab-report`);
    return res.data.data;
  },

  async updateProgress(storyId: string, chapterIndex: number): Promise<IStoryProgress> {
    const res = await api.post(`/api/stories/${storyId}/progress`, { chapterIndex });
    return res.data.data;
  },

  async getProgress(storyId: string): Promise<IStoryProgress | null> {
    const res = await api.get(`/api/stories/${storyId}/progress`);
    return res.data.data;
  },

  async generateChapterAudio(storyId: string, chapterIndex: number, voice = "nova") {
    const res = await api.post(`/api/stories/${storyId}/chapters/${chapterIndex}/generate-audio`, { voice });
    return res.data.data as { urlAudio: string; recordId: string };
  },
};
