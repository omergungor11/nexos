import { create } from "zustand";
import type { EditorTool } from "@/lib/editor/fabric-editor-types";

interface EditorStore {
  // Selection
  selectedObjectId: string | null;
  // Tool
  activeTool: EditorTool;
  // Template
  templateId: string;
  // Dirty flag
  isDirty: boolean;
  // Undo/Redo stacks (serialized canvas JSON)
  undoStack: string[];
  redoStack: string[];

  // Actions
  selectObject: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  setTemplateId: (id: string) => void;
  setDirty: (dirty: boolean) => void;
  pushHistory: (json: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  reset: () => void;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorStore>()((set, get) => ({
  selectedObjectId: null,
  activeTool: "select",
  templateId: "",
  isDirty: false,
  undoStack: [],
  redoStack: [],

  selectObject: (id) => set({ selectedObjectId: id }),
  setTool: (tool) => set({ activeTool: tool }),
  setTemplateId: (id) => set({ templateId: id }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  pushHistory: (json) => {
    const { undoStack } = get();
    const next = [...undoStack, json];
    if (next.length > MAX_HISTORY) next.shift();
    set({ undoStack: next, redoStack: [], isDirty: true });
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length < 2) return null;
    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
    });
    return previous;
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;
    const next = redoStack[redoStack.length - 1];
    set({
      undoStack: [...undoStack, next],
      redoStack: redoStack.slice(0, -1),
    });
    return next;
  },

  reset: () =>
    set({
      selectedObjectId: null,
      activeTool: "select",
      isDirty: false,
      undoStack: [],
      redoStack: [],
    }),
}));
