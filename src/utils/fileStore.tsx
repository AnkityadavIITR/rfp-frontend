import { create } from "zustand";

interface FileState {
  files: File[];
  selectedFiles: File[];
  selectFile: (file: File) => void;
  addFiles: (file: File[]) => void;
  deleteFile: (index: number) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  selectedFiles: [],
  selectFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles,file] })), 
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  deleteFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
}));
