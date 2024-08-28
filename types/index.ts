export type ProjectStructureSchema = {
  [key in string]: ProjectStructureSchema | 1 | "**";
};
