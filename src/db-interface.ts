import { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Author {
  id: Generated<number>;
  lastname: string;
  name: string;
}

export interface MikroOrmMigrations {
  executed_at: Generated<string | null>;
  id: Generated<number>;
  name: string | null;
}

export interface Note {
  author_id: number;
  content: string;
  id: Generated<number>;
  title: string;
}

export interface DB {
  author: Author;
  mikro_orm_migrations: MikroOrmMigrations;
  note: Note;
}
