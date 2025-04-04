export interface Note {
  id?: number;
  authorName?: string;
  name: string;
  content: string;
  author: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateNote = Pick<Note, 'name' | 'content' | 'author' | 'tags'>;
export type UpdateNote = Pick<
  Note,
  'id' | 'name' | 'content' | 'author' | 'tags'
>;
