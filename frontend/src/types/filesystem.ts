// File System Types for Code Playground

export type FileType = 'file' | 'directory'

export interface FileNode {
  id: string
  name: string
  type: FileType
  content?: string
  language?: string
  children?: FileNode[]
  parentId?: string
  createdAt: number
  updatedAt: number
}

export interface FileSystemState {
  files: Record<string, FileNode>
  rootId: string
}

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  files: FileNode[]
}
