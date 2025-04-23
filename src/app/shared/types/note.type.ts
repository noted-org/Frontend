export interface Note {
  id?: number;
  authorName?: string;
  name: string;
  content: string;
  author: string;
  tags?: { name: string; id: number }[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateNote = Omit<
  Note,
  'id' | 'authorName' | 'tags' | 'createdAt' | 'updatedAt'
> & {
  tags: number[];
};
export type UpdateNote = Pick<
  Note,
  'id' | 'name' | 'content' | 'author' | 'tags'
>;
