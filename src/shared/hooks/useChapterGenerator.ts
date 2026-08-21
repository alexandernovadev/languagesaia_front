import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { storyService } from "@/services/storyService";
import { IStory } from "@/types/models/Story";

interface UseChapterGeneratorReturn {
  generating: boolean;
  generatingChapter: string;
  generateChapter: (
    instructions: string,
    requestEnding: boolean,
    chapterNumber: number
  ) => Promise<IStory | null>;
  cancelGenerate: () => void;
}

export function useChapterGenerator(storyId: string | undefined): UseChapterGeneratorReturn {
  const [generating, setGenerating] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generateChapter = useCallback(
    async (instructions: string, requestEnding: boolean, chapterNumber: number): Promise<IStory | null> => {
      if (!storyId) return null;
      setGenerating(true);
      setGeneratingChapter("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await storyService.generateChapter(storyId, instructions, requestEnding, controller.signal);
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let acc = "";
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          acc += decoder.decode(value, { stream: true });
          setGeneratingChapter(acc);
        }

        const saved = await storyService.saveChapter(storyId, {
          title: `Chapter ${chapterNumber}`,
          content: acc,
        });
        toast.success("Chapter saved!");
        return saved;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error(err.response?.data?.message || err.message || "Error generating chapter");
        }
        return null;
      } finally {
        setGenerating(false);
        setGeneratingChapter("");
        abortRef.current = null;
      }
    },
    [storyId]
  );

  const cancelGenerate = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { generating, generatingChapter, generateChapter, cancelGenerate };
}
