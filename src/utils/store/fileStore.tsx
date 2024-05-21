import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FileState {
  files: File[];
  selectedFiles: File[];
  selectFile: (file: File) => void;
  removeSelectedFile: (name: string) => void;
  addFiles: (file: File[]) => void;
  deleteFile: (index: number) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      files: [],
      selectedFiles: [],
      selectFile: (file) =>
        set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
      removeSelectedFile: (name) =>
        set((state) => ({
          selectedFiles: state.selectedFiles.filter(
            (file) => file.name !== name
          ),
        })),
      addFiles: (newFiles) =>
        set((state) => ({ files: [...state.files, ...newFiles] })),
      deleteFile: (index) =>
        set((state) => ({
          files: state.files.filter((_, i) => i !== index),
        })),
    }),
    {
      name: "file-storage", // unique name for persisting state
      getStorage: () => localStorage, // or sessionStorage
    }
  )
);