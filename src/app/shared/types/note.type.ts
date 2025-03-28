export interface Note {
  id?: number;
  authorName?: string;
  name: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateNote = Pick<Note, 'name' | 'content' | 'author'>;
export type UpdateNote = Pick<Note, 'id' | 'name' | 'content' | 'author'>;
