import { axiosClient as api } from "./api/HttpClient";
import { useUserStore } from "@/lib/store/user-store";
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
    return res.data.data;
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

  async generateChapter(
    storyId: string,
    instructions?: string,
    requestEnding?: boolean,
    targetVocabulary?: string[],
    targetGrammar?: string[],
    signal?: AbortSignal
  ) {
    const token = useUserStore.getState().token;
    const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/stories/${storyId}/chapters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ instructions, requestEnding, targetVocabulary, targetGrammar }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to generate chapter");
    }

    return response;
  },

  async saveChapter(
    storyId: string,
    chapterData: { title: string; content: string; targetVocabulary?: string[]; targetGrammar?: string[] }
  ) {
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

  async generateStoryIdea(seed?: string, genre?: string, languageLevel?: string) {
    const res = await api.post(`/api/stories/generate-idea`, { seed, genre, languageLevel });
    return res.data.data as { title: string; description: string };
  },
};
