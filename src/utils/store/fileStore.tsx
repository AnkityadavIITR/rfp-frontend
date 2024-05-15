import { create } from "zustand";

interface FileState {
  files: File[];
  selectedFiles: File[];
  selectFile: (file: File) => void;
  removeSelectedFile:(name:String)=>void;
  addFiles: (file: File[]) => void;
  deleteFile: (index: number) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  selectedFiles: [],
  selectFile: (file) => set((state) => ({ selectedFiles: [...state.selectedFiles, file] })),
  removeSelectedFile: (name) => set((state) => ({ selectedFiles: state.selectedFiles.filter((file) => file.name !== name) })),
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  deleteFile: (index) =>
    set((state) => ({
      files: state.files.filter((_, i) => i !== index),
    })),
}));

