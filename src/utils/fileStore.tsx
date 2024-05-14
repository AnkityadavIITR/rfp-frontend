import { create } from "zustand";

interface FileState {
  files: File[];
  selectedFiles: File[];
  selectFiles: (files: File[]) => void;
  addFiles: (file: File[]) => void;
  deleteFile: (index: number) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  selectedFiles: [],
  selectFiles: (files) => set((state) => ({ selectedFiles:[...files] })),
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  deleteFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
}));
