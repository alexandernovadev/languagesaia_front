import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { IExam } from '@/types/models';

interface ExamsUIState {
  previewOpen: boolean;
  previewExam: IExam | null;
  deleteOpen: boolean;
  examToDelete: IExam | null;
  deleteLoading: boolean;

  setPreviewOpen: (open: boolean) => void;
  setPreviewExam: (exam: IExam | null) => void;
  setDeleteOpen: (open: boolean) => void;
  setExamToDelete: (exam: IExam | null) => void;
  setDeleteLoading: (loading: boolean) => void;
  resetUI: () => void;
}

const initialState = {
  previewOpen: false,
  previewExam: null,
  deleteOpen: false,
  examToDelete: null,
  deleteLoading: false,
};

export const useExamsUIStore = create<ExamsUIState>()(
  devtools(
    (set) => ({
      ...initialState,
      setPreviewOpen: (open) => set({ previewOpen: open }),
      setPreviewExam: (exam) => set({ previewExam: exam }),
      setDeleteOpen: (open) => set({ deleteOpen: open }),
      setExamToDelete: (exam) => set({ examToDelete: exam }),
      setDeleteLoading: (loading) => set({ deleteLoading: loading }),
      resetUI: () => set(initialState),
    }),
    { name: 'exams-ui-store', enabled: process.env.NODE_ENV === 'development' }
  )
);
