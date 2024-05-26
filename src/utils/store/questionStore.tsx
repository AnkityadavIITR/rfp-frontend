import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FileUrl {
  id:string,
  filename: string;
  url: string;
}

interface QuestionState {
  queries: string[];
  fileUrls:FileUrl[];
  addFileUrl: (files: FileUrl) => void;
  responses: string[];
  addQueries: (questions: string[]) => void;
  addResponse: (response: string) => void;
  clearQueries: () => void;
  setQuestions: (questions: string[]) => void;
}

const useQuestionStore = create<QuestionState>()(
  persist(
    (set) => ({
      queries: [],
      fileUrls:[],
      addFileUrl: (file) => 
        set((state) => {
          const existingFile = state.fileUrls.find((f) => f.filename === file.filename);
          if (!existingFile) {
            return { fileUrls: [...state.fileUrls, file] };
          }
          return state;
        }),
      responses: [],
      addQueries: (questions) =>
        set((state) => ({
          queries: [...state.queries, ...questions],
        })),
      addResponse: (response) =>
        set((state) => ({
          responses: [...state.responses, response],
        })),

      clearQueries: () => set({ queries: [] }),

      setQuestions: (queries) => set({ queries }),
    }),
    {
      name: 'questions-storage', 
      getStorage: () => localStorage,
    }
  )
);

function clearData() {
  useQuestionStore.setState({ queries: [], responses: [],fileUrls:[] }); // Reset Zustand store
  localStorage.removeItem('questions-storage'); // Remove item from local storage
}

export { useQuestionStore, clearData };